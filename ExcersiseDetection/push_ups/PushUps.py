from flask import Flask, request, jsonify # Request and jsonify are used to handle incoming requests and send JSON responses
from flask_cors import CORS # CORS is used to handle cross-origin requests
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
# import os  -> MAY BE USED LATER
import base64
# import time -> MAY BE USED LATER
from joblib import load

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Initialize MediaPipe Pose
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Path to model files
# DATA_DIR = "push_ups" -> MAY BE USED LATER
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
    static_image_mode=False  # For video processing
)

def calculate_angle(a, b, c):
    a = np.array(a)  # First point
    b = np.array(b)  # Mid point
    c = np.array(c)  # End point
    
    # Calculate vectors
    ba = a - b
    bc = c - b
    
    # Calculate angle using the dot product
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)  # Ensure value is within domain of arccos
    angle = np.arccos(cosine_angle)
    
    # Convert to degrees
    angle = np.degrees(angle)
    
    return angle

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'classes': label_encoder.classes_.tolist() if label_encoder else None
    })
@app.route('/')
def home():
    return "PushUps AI Server is running!"

@app.route('/api/process-frame', methods=['POST'])
def process_frame():
    """Process a single video frame for pose detection"""
    if not request.json or 'image' not in request.json:
        return jsonify({'error': 'No image data provided'}), 400
    
    if model is None or label_encoder is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        # Decode base64 image
        image_data = request.json['image'].split(',')[1] if ',' in request.json['image'] else request.json['image']
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Process image
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False
        results = pose.process(image_rgb)
        
        if not results.pose_landmarks:
            return jsonify({
                'position': 'unknown',
                'confidence': 0,
                'landmarks': None,
                'angles': None
                # 'form_feedback': 'No pose detected' # FUTURE IMPLEMENTATION
            })
        
        # Extract landmarks
        landmarks = results.pose_landmarks.landmark
        
        # Prepare features
        features = []
        for i in range(33):  # MediaPipe has 33 landmarks
            features.extend([landmarks[i].x, landmarks[i].y])
        
        # Create a DataFrame with the same column names used during training
        feature_cols = []
        for i in range(33):
            feature_cols.extend([f'x_{i}', f'y_{i}'])
        
        X = pd.DataFrame([features], columns=feature_cols)
        
        # Model Predicts if the user is in the 'UP' or 'DOWN' position
        prediction_prob = model.predict_proba(X)[0]
        predicted_class_idx = np.argmax(prediction_prob)
        predicted_class = label_encoder.inverse_transform([predicted_class_idx])[0]
        confidence = float(prediction_prob[predicted_class_idx])
        
        # Calculate arm angles for form analysis
        # Right arm angle (shoulder - elbow - wrist)
        right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                         landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
        right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
        
        right_elbow_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
        
        # Left arm angle
        left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        
        left_elbow_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
        
        # FUTURE IMPLEMENTATION: ******************************************
        # Form analysis based on arm angles
        # form_feedback = ""
        # form_score = 0
        
        # if predicted_class == 'down':
        #     # Check for proper elbow angles in down position (should be around 90 degrees)
        #     avg_elbow_angle = (right_elbow_angle + left_elbow_angle) / 2
        #     if avg_elbow_angle < 70:
        #         form_feedback = "Go deeper - lower your chest"
        #         form_score = 0.6
        #     elif avg_elbow_angle > 110:
        #         form_feedback = "Bend your elbows more"
        #         form_score = 0.7
        #     else:
        #         form_feedback = "Good form!"
        #         form_score = 0.9
        # elif predicted_class == 'up':
        #     # Check for proper arm extension in up position
        #     avg_elbow_angle = (right_elbow_angle + left_elbow_angle) / 2
        #     if avg_elbow_angle < 150:
        #         form_feedback = "Extend arms fully at the top"
        #         form_score = 0.7
        #     else:
        #         form_feedback = "Good form!"
        #         form_score = 0.9
        # FUTURE IMPLEMENTATION: ******************************************
        
        # Prepare landmark data for frontend
        landmark_list = []
        for i, landmark in enumerate(landmarks):
            landmark_list.append({
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })
        
        # Return results
        return jsonify({
            'position': predicted_class,
            'confidence': confidence,
            'landmarks': landmark_list,
            'angles': {
                'right_elbow': float(right_elbow_angle),
                'left_elbow': float(left_elbow_angle)
            }
            # 'form_feedback': form_feedback, -> FUTURE IMPLEMENTATION
            # 'form_score': float(form_score) -> FUTURE IMPLEMENTATION
        })
    
    except Exception as e:
        print(f"Error processing frame: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/record-exercise', methods=['POST'])
def record_exercise():
    """Record completed exercise to user profile"""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['userId', 'exercise', 'reps', 'formScore']
    if not all(field in request.json for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user_id = request.json['userId']
    exercise_type = request.json['exercise']
    reps = request.json['reps']
    form_score = request.json['formScore']
    
    # Calculate XP based on reps and form quality
    base_xp_per_rep = 20
    # form_multiplier = (0.5 + form_score / 2)  # FUTURE IMPLEMENTATION -> (Ex: ok (.5), good(1), great(1.5), etc...)
    
    total_xp = int(reps * base_xp_per_rep) # # FUTURE IMPLEMENTATION -> int(reps * base_xp_per_rep * form_multiplier) 
    
    # Return the results
    return jsonify({
        'success': True,
        'xpEarned': total_xp,
        'newReps': reps,
        'message': f"Recorded {reps} {exercise_type}s earning {total_xp} XP!"
    })

if __name__ == "__main__": # This block ensures that the Flask app runs only when this script is executed directly
    app.run(host='0.0.0.0', port=5002, debug=True)