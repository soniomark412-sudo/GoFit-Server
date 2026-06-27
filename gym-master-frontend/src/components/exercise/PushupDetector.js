import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Assuming you have an auth context

// API configuration
const API_URL = 'http://localhost:5002/api';

const PushupDetector = () => {
  const { user } = useContext(AuthContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [pushupCount, setPushupCount] = useState(0);
  const [position, setPosition] = useState('unknown');
  const [confidence, setConfidence] = useState(0);
  const [formFeedback, setFormFeedback] = useState('');
//   const [formScore, setFormScore] = useState(0); -> FUTURE IMPLEMENTATION
  const [rightElbowAngle, setRightElbowAngle] = useState(0);
  const [leftElbowAngle, setLeftElbowAngle] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Click Start to begin');
  const [errorMessage, setErrorMessage] = useState('');
  const [xpEarned, setXpEarned] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
//   const [cumulativeFormScore, setCumulativeFormScore] = useState(0); -> FUTURE IMPLEMENTATION
//   const [formScoreCount, setFormScoreCount] = useState(0); -> FUTURE IMPLEMENTATION

  // Refs for tracking state between frames
  const prevPositionRef = useRef(null);
  const isActiveRef = useRef(false);
  const pushupCountRef = useRef(0);
  const cumulativeFormScoreRef = useRef(0);
  const formScoreCountRef = useRef(0);
  const processingFrameRef = useRef(false);

  // Setup webcam
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setErrorMessage(`Error accessing webcam: ${err.message}`);
        console.error('Error accessing webcam:', err);
      }
    };

    setupCamera();

    return () => {
      // Cleanup: stop webcam stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Setup canvas for drawing pose landmarks
  useEffect(() => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Main processing loop
  useEffect(() => {
    let animationFrameId;
    
    const processFrame = async () => {
      if (!isActiveRef.current || processingFrameRef.current) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
      
      if (!videoRef.current || !videoRef.current.videoWidth) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
      
      // Set processing flag to avoid multiple simultaneous processing
      processingFrameRef.current = true;
      
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send frame to API
        const response = await axios.post(`${API_URL}/process-frame`, {
          image: imageData
        });
        
        // Process the results
        if (response.data) {
          const { position: newPosition, confidence: newConfidence, landmarks, angles, form_feedback, form_score } = response.data;
          
          setPosition(newPosition);
          setConfidence(newConfidence);
          setFormFeedback(form_feedback);
        //   setFormScore(form_score); -> FUTURE IMPLEMENTATION
          
          if (angles) {
            setRightElbowAngle(angles.right_elbow);
            setLeftElbowAngle(angles.left_elbow);
          }
          
          // Count push-ups: when transitioning from down to up
          if (newPosition === 'up' && prevPositionRef.current === 'down') {
            pushupCountRef.current += 1;
            setPushupCount(pushupCountRef.current);
            
            // Track form score for the pushup
            cumulativeFormScoreRef.current += form_score;
            formScoreCountRef.current += 1;
            // setCumulativeFormScore(cumulativeFormScoreRef.current); -> FUTURE IMPLEMENTATION
            // setFormScoreCount(formScoreCountRef.current); -> FUTURE IMPLEMENTATION
          }
          
          prevPositionRef.current = newPosition;
          
          // Draw landmarks on canvas
          if (landmarks && canvasRef.current) {
            drawPose(landmarks);
          }
        }
      } catch (error) {
        console.error('Error processing frame:', error);
      } finally {
        processingFrameRef.current = false;
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };
    
    if (isActive) {
      isActiveRef.current = true;
      animationFrameId = requestAnimationFrame(processFrame);
    } else {
      isActiveRef.current = false;
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive]);

  // Draw pose landmarks on canvas
  const drawPose = (landmarks) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    const connections = [
      // Head
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Torso
      [11, 12], [12, 24], [24, 23], [23, 11],
      // Left arm
      [11, 13], [13, 15],
      // Right arm
      [12, 14], [14, 16],
      // Left leg
      [23, 25], [25, 27],
      // Right leg
      [24, 26], [26, 28]
    ];
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'blue';
    
    for (const [i, j] of connections) {
      const pt1 = landmarks[i];
      const pt2 = landmarks[j];
      
      ctx.beginPath();
      ctx.moveTo(pt1.x * canvas.width, pt1.y * canvas.height);
      ctx.lineTo(pt2.x * canvas.width, pt2.y * canvas.height);
      ctx.stroke();
    }
    
    // Draw keypoints
    ctx.fillStyle = 'red';
    for (const point of landmarks) {
      ctx.beginPath();
      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  };

  // Start/stop detection
  const toggleDetection = () => {
    if (isActive) {
      setStatusMessage('Detection stopped');
    } else {
      setStatusMessage('Detection active');
    }
    setIsActive(!isActive);
  };

  // Reset counter
  const resetCounter = () => {
    pushupCountRef.current = 0;
    setPushupCount(0);
    cumulativeFormScoreRef.current = 0;
    formScoreCountRef.current = 0;
    // setCumulativeFormScore(0); -> FUTURE IMPLEMENTATION
    // setFormScoreCount(0); -> FUTURE IMPLEMENTATION
    setXpEarned(0);
    setStatusMessage('Counter reset');
  };

  // Submit workout to backend
  const submitWorkout = async () => {
    if (pushupCount === 0) {
      setStatusMessage('No push-ups to submit');
      return;
    }
    
    if (!user || !user._id) {
      setErrorMessage('You must be logged in to save your workout');
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage('Submitting workout...');
    
    try {
      // Calculate average form score
    //   const avgFormScore = formScoreCount > 0 ? cumulativeFormScore / formScoreCount : 0; -> FUTURE IMPLEMENTATION
      
      const response = await axios.post(`${API_URL}/record-exercise`, {
        userId: user._id,
        exercise: 'pushup',
        reps: pushupCount,
        // formScore: avgFormScore -> FUTURE IMPLEMENTATION
      });
      
      if (response.data.success) {
        setXpEarned(response.data.xpEarned);
        setStatusMessage(response.data.message);
        
        // Reset for new workout session
        resetCounter();
      } else {
        setErrorMessage('Failed to save workout');
      }
    } catch (error) {
      console.error('Error submitting workout:', error);
      setErrorMessage('Error submitting workout: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pushup-detector">
      <div className="detector-header">
        <h2 className="display-4 fw-bold mb-4">Push-up AI Coach</h2>
        <div className="status-message">
          {statusMessage}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
      </div>
      
      <div className="video-container">
        <div className="panel">
          <div className="metric">
            <div className="metric-label">PROBABILITY</div>
            <div className={`metric-value ${position === 'up' ? 'up' : 'down'}`}>
              {confidence.toFixed(2)}
            </div>
          </div>
          
          <div className="metric">
            <div className="metric-label">CLASS</div>
            <div className={`metric-value ${position === 'up' ? 'up' : 'down'}`}>
              {position.toUpperCase()}
            </div>
          </div>
          
          <div className="metric">
            <div className="metric-label">REP COUNTER</div>
            <div className={`metric-value counter`}>
              {pushupCount}
            </div>
          </div>
          
          {xpEarned > 0 && (
            <div className="metric">
              <div className="metric-label">XP EARNED</div>
              <div className="metric-value xp">
                +{xpEarned}
              </div>
            </div>
          )}
        </div>
        
        <div className="video-wrapper">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="pose-canvas"
          />
        </div>
        
        <div className="form-feedback">
          <div className="angle-data">
            R.Elbow: {Math.round(rightElbowAngle)}° | L.Elbow: {Math.round(leftElbowAngle)}°
          </div>
          <div className="feedback-message">
            {formFeedback}
          </div>
        </div>
      </div>
      
      <div className="controls">
        <button 
          className={`control-btn ${isActive ? 'stop' : 'start'}`} 
          onClick={toggleDetection}
        >
          {isActive ? 'Stop' : 'Start'}
        </button>
        
        <button 
          className="control-btn reset" 
          onClick={resetCounter}
        >
          Reset
        </button>
        
        <button 
          className="control-btn submit" 
          onClick={submitWorkout}
          disabled={isSubmitting || pushupCount === 0}
        >
          {isSubmitting ? 'Saving...' : 'Save Workout'}
        </button>
      </div>
    </div>
  );
};

export default PushupDetector;