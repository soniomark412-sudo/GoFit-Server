from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from dotenv import load_dotenv
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import base64
from joblib import load
from datetime import timedelta
import pymongo

# ==============================================
# 🔧 ENVIRONMENT VARIABLES (Works with or without .env)
# ==============================================

# Try to load .env file (for local development)
# If .env doesn't exist (on Render), it silently continues
load_dotenv(override=True)  # override=True ensures environment variables take precedence

# Get environment variables (from .env locally OR from Render's Environment section)
MONGODB_URI = os.getenv("MONGODB_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

print("🔍 Environment check:")
print(f"  - MONGODB_URI: {'✅ Set' if MONGODB_URI else '❌ NOT SET'}")
print(f"  - JWT_SECRET_KEY: {'✅ Set' if JWT_SECRET_KEY else '❌ NOT SET'}")

# ==============================================
# 🚀 FLASK APP INITIALIZATION
# ==============================================

app = Flask(__name__)

# Configuration
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)

# ==============================================
# 🔗 DATABASE CONNECTION (Raw PyMongo)
# ==============================================

db = None  # Initialize db variable

if MONGODB_URI:
    try:
        mongo_client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Force connection
        mongo_client.admin.command('ping')
        print("✅ MongoDB connected successfully!")
        db = mongo_client.get_database("gofit")  # Your database name
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        import traceback
        traceback.print_exc()
        db = None
else:
    print("❌ MONGODB_URI not set. Database will not be available.")

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)  # Allow cross-origin requests

# ==============================================
# 🧠 MEDIAPIPE POSE DETECTION
# ==============================================

# Initialize MediaPipe Pose
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Path to model files
MODEL_FILE = "pushup_model.joblib"
ENCODER_FILE = "label_encoder.joblib"

# Load model and label encoder
try:
    model = load(MODEL_FILE)
    label_encoder = load(ENCODER_FILE)
    print("Model loaded successfully!")
    print(f"Classes: {label_encoder.classes_}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    label_encoder = None

# Initialize pose detector
pose = mp_pose.Pose(
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7,
    static_image_mode=False
)


def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.arccos(cosine_angle)
    angle = np.degrees(angle)

    return angle


# ==============================================
# 🔐 AUTHENTICATION ENDPOINTS
# ==============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    if db is None:
        return jsonify({'error': 'Database connection failed. Please try again later.'}), 500

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Check if user already exists
    if db.users.find_one({'username': username}):
        return jsonify({'error': 'Username already exists'}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Insert user into database
    user_id = db.users.insert_one({
        'username': username,
        'password': hashed_password,
        'email': email,
        'created_at': pd.Timestamp.now()
    }).inserted_id

    return jsonify({
        'message': 'User created successfully',
        'user_id': str(user_id)
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user with username and password"""
    if db is None:
        return jsonify({'error': 'Database connection failed. Please try again later.'}), 500

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = db.users.find_one({'username': username})

    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401

    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=str(user['_id']))

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': str(user['_id']),
            'username': user['username'],
            'email': user.get('email')
        }
    }), 200


@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile (protected route)"""
    if db is None:
        return jsonify({'error': 'Database connection failed'}), 500

    user_id = get_jwt_identity()
    user = db.users.find_one({'_id': user_id}, {'password': 0})

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user['_id'] = str(user['_id'])
    return jsonify(user), 200


# ==============================================
# 🧠 AI / EXERCISE ENDPOINTS
# ==============================================

@app.route('/')
def home():
    return "PushUps AI Server is running!"


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'classes': label_encoder.classes_.tolist() if label_encoder else None
    })


@app.route('/api/process-frame', methods=['POST'])
@jwt_required()
def process_frame():
    user_id = get_jwt_identity()

    if not request.json or 'image' not in request.json:
        return jsonify({'error': 'No image data provided'}), 400

    if model is None or label_encoder is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        image_data = request.json['image'].split(',')[1] if ',' in request.json['image'] else request.json['image']
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False
        results = pose.process(image_rgb)

        if not results.pose_landmarks:
            return jsonify({
                'position': 'unknown',
                'confidence': 0,
                'landmarks': None,
                'angles': None
            })

        landmarks = results.pose_landmarks.landmark

        features = []
        for i in range(33):
            features.extend([landmarks[i].x, landmarks[i].y])

        feature_cols = []
        for i in range(33):
            feature_cols.extend([f'x_{i}', f'y_{i}'])

        X = pd.DataFrame([features], columns=feature_cols)

        prediction_prob = model.predict_proba(X)[0]
        predicted_class_idx = np.argmax(prediction_prob)
        predicted_class = label_encoder.inverse_transform([predicted_class_idx])[0]
        confidence = float(prediction_prob[predicted_class_idx])

        right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                          landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
        right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

        right_elbow_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)

        left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

        left_elbow_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)

        landmark_list = []
        for i, landmark in enumerate(landmarks):
            landmark_list.append({
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })

        return jsonify({
            'position': predicted_class,
            'confidence': confidence,
            'landmarks': landmark_list,
            'angles': {
                'right_elbow': float(right_elbow_angle),
                'left_elbow': float(left_elbow_angle)
            }
        })

    except Exception as e:
        print(f"Error processing frame: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/record-exercise', methods=['POST'])
@jwt_required()
def record_exercise():
    user_id = get_jwt_identity()

    if db is None:
        return jsonify({'error': 'Database connection failed'}), 500

    if not request.json:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['exercise', 'reps', 'formScore']
    if not all(field in request.json for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    exercise_type = request.json['exercise']
    reps = request.json['reps']
    form_score = request.json['formScore']

    base_xp_per_rep = 20
    total_xp = int(reps * base_xp_per_rep)

    db.exercises.insert_one({
        'user_id': user_id,
        'exercise': exercise_type,
        'reps': reps,
        'form_score': form_score,
        'xp_earned': total_xp,
        'created_at': pd.Timestamp.now()
    })

    return jsonify({
        'success': True,
        'xpEarned': total_xp,
        'newReps': reps,
        'message': f"Recorded {reps} {exercise_type}s earning {total_xp} XP!"
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5002, debug=True)