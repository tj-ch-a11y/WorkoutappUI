import cv2
import numpy as np
import json
import sys
from typing import Dict, List, Tuple
import math

class ExerciseDetector:
    def __init__(self):
        self.push_up_count = 0
        self.squat_count = 0
        self.punch_count = 0
        self.exercise_state = "up"  # up, down for push-ups and squats
        self.punch_state = "ready"  # ready, punching
        self.confidence_threshold = 0.5
        self.prev_frame = None
        
    def calculate_angle(self, a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
        """Calculate angle between three points"""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle
    
    def detect_push_ups(self, landmarks: List[Dict]) -> Dict:
        """Detect push-up exercise using body landmarks"""
        try:
            # Key points for push-up detection
            left_shoulder = (landmarks[11]['x'], landmarks[11]['y'])
            left_elbow = (landmarks[13]['x'], landmarks[13]['y'])
            left_wrist = (landmarks[15]['x'], landmarks[15]['y'])
            
            right_shoulder = (landmarks[12]['x'], landmarks[12]['y'])
            right_elbow = (landmarks[14]['x'], landmarks[14]['y'])
            right_wrist = (landmarks[16]['x'], landmarks[16]['y'])
            
            # Calculate arm angles
            left_arm_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_arm_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            
            avg_arm_angle = (left_arm_angle + right_arm_angle) / 2
            
            # Push-up logic: down position when arms are bent (angle < 90), up when extended (angle > 160)
            if avg_arm_angle < 90 and self.exercise_state == "up":
                self.exercise_state = "down"
            elif avg_arm_angle > 160 and self.exercise_state == "down":
                self.exercise_state = "up"
                self.push_up_count += 1
                
            form_score = min(100, max(0, (180 - abs(left_arm_angle - right_arm_angle)) / 180 * 100))
            
            return {
                "count": self.push_up_count,
                "form_score": round(form_score, 1),
                "state": self.exercise_state,
                "arm_angle": round(avg_arm_angle, 1)
            }
            
        except (KeyError, IndexError):
            return {"count": self.push_up_count, "form_score": 0, "state": "error", "arm_angle": 0}
    
    def detect_squats(self, landmarks: List[Dict]) -> Dict:
        """Detect squat exercise using body landmarks"""
        try:
            # Key points for squat detection
            left_hip = (landmarks[23]['x'], landmarks[23]['y'])
            left_knee = (landmarks[25]['x'], landmarks[25]['y'])
            left_ankle = (landmarks[27]['x'], landmarks[27]['y'])
            
            right_hip = (landmarks[24]['x'], landmarks[24]['y'])
            right_knee = (landmarks[26]['x'], landmarks[26]['y'])
            right_ankle = (landmarks[28]['x'], landmarks[28]['y'])
            
            # Calculate knee angles
            left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
            right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
            
            avg_knee_angle = (left_knee_angle + right_knee_angle) / 2
            
            # Squat logic: down position when knees are bent (angle < 120), up when extended (angle > 160)
            if avg_knee_angle < 120 and self.exercise_state == "up":
                self.exercise_state = "down"
            elif avg_knee_angle > 160 and self.exercise_state == "down":
                self.exercise_state = "up"
                self.squat_count += 1
                
            form_score = min(100, max(0, (180 - abs(left_knee_angle - right_knee_angle)) / 180 * 100))
            
            return {
                "count": self.squat_count,
                "form_score": round(form_score, 1),
                "state": self.exercise_state,
                "knee_angle": round(avg_knee_angle, 1)
            }
            
        except (KeyError, IndexError):
            return {"count": self.squat_count, "form_score": 0, "state": "error", "knee_angle": 0}
    
    def detect_punches(self, landmarks: List[Dict]) -> Dict:
        """Detect punching exercise using hand movement"""
        try:
            # Key points for punch detection
            left_shoulder = (landmarks[11]['x'], landmarks[11]['y'])
            left_elbow = (landmarks[13]['x'], landmarks[13]['y'])
            left_wrist = (landmarks[15]['x'], landmarks[15]['y'])
            
            right_shoulder = (landmarks[12]['x'], landmarks[12]['y'])
            right_elbow = (landmarks[14]['x'], landmarks[14]['y'])
            right_wrist = (landmarks[16]['x'], landmarks[16]['y'])
            
            # Calculate arm extension
            left_arm_extension = math.sqrt((left_wrist[0] - left_shoulder[0])**2 + (left_wrist[1] - left_shoulder[1])**2)
            right_arm_extension = math.sqrt((right_wrist[0] - right_shoulder[0])**2 + (right_wrist[1] - right_shoulder[1])**2)
            
            max_extension = max(left_arm_extension, right_arm_extension)
            
            # Punch logic: punch when arm is extended beyond threshold
            if max_extension > 0.3 and self.punch_state == "ready":
                self.punch_state = "punching"
                self.punch_count += 1
            elif max_extension < 0.2:
                self.punch_state = "ready"
                
            # Simple form score based on arm coordination
            form_score = min(100, max(0, 100 - abs(left_arm_extension - right_arm_extension) * 200))
            
            return {
                "count": self.punch_count,
                "form_score": round(form_score, 1),
                "state": self.punch_state,
                "extension": round(max_extension, 3)
            }
            
        except (KeyError, IndexError):
            return {"count": self.punch_count, "form_score": 0, "state": "error", "extension": 0}
    
    def detect_push_ups_simple(self, frame: np.ndarray) -> Dict:
        """Simple push-up detection using motion and brightness analysis"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            height, width = gray.shape
            
            # Focus on upper body region (top 60% of frame)
            upper_region = gray[:int(height * 0.6), :]
            
            # Calculate average brightness in upper region
            avg_brightness = np.mean(upper_region)
            
            # Simple motion detection
            motion_detected = False
            if self.prev_frame is not None:
                diff = cv2.absdiff(gray, self.prev_frame)
                motion_score = np.mean(diff)
                motion_detected = motion_score > 10
            
            self.prev_frame = gray.copy()
            
            # Push-up logic based on brightness changes (person moving up/down)
            # When person goes down, more background is visible (brighter)
            # When person goes up, less background is visible (darker)
            
            if avg_brightness > 120 and self.exercise_state == "up" and motion_detected:
                self.exercise_state = "down"
            elif avg_brightness < 100 and self.exercise_state == "down" and motion_detected:
                self.exercise_state = "up"
                self.push_up_count += 1
                
            # Simple form score based on motion consistency
            form_score = 85 if motion_detected else 70
            
            return {
                "count": self.push_up_count,
                "form_score": form_score,
                "state": self.exercise_state,
                "brightness": round(avg_brightness, 1)
            }
            
        except Exception as e:
            return {"count": self.push_up_count, "form_score": 0, "state": "error", "error": str(e)}
    
    def detect_squats_simple(self, frame: np.ndarray) -> Dict:
        """Simple squat detection using motion and position analysis"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            height, width = gray.shape
            
            # Focus on lower body region (bottom 60% of frame)
            lower_region = gray[int(height * 0.4):, :]
            
            # Calculate center of mass in lower region
            moments = cv2.moments(lower_region)
            if moments["m00"] != 0:
                center_y = int(moments["m01"] / moments["m00"])
            else:
                center_y = height // 2
            
            # Motion detection
            motion_detected = False
            if self.prev_frame is not None:
                diff = cv2.absdiff(gray, self.prev_frame)
                motion_score = np.mean(diff)
                motion_detected = motion_score > 8
            
            self.prev_frame = gray.copy()
            
            # Squat logic: when person squats down, center of mass moves down
            relative_center = center_y / height
            
            if relative_center > 0.7 and self.exercise_state == "up" and motion_detected:
                self.exercise_state = "down"
            elif relative_center < 0.5 and self.exercise_state == "down" and motion_detected:
                self.exercise_state = "up"
                self.squat_count += 1
                
            form_score = 80 if motion_detected else 65
            
            return {
                "count": self.squat_count,
                "form_score": form_score,
                "state": self.exercise_state,
                "center_y": round(relative_center, 3)
            }
            
        except Exception as e:
            return {"count": self.squat_count, "form_score": 0, "state": "error", "error": str(e)}
    
    def detect_punches_simple(self, frame: np.ndarray) -> Dict:
        """Simple punch detection using motion analysis"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Motion detection for punches
            motion_detected = False
            motion_intensity = 0
            
            if self.prev_frame is not None:
                diff = cv2.absdiff(gray, self.prev_frame)
                motion_intensity = np.mean(diff)
                motion_detected = motion_intensity > 15
            
            self.prev_frame = gray.copy()
            
            # Punch logic: high motion intensity indicates punching
            if motion_intensity > 20 and self.punch_state == "ready":
                self.punch_state = "punching"
                self.punch_count += 1
            elif motion_intensity < 10:
                self.punch_state = "ready"
                
            form_score = min(100, max(50, motion_intensity * 3))
            
            return {
                "count": self.punch_count,
                "form_score": round(form_score, 1),
                "state": self.punch_state,
                "motion": round(motion_intensity, 1)
            }
            
        except Exception as e:
            return {"count": self.punch_count, "form_score": 0, "state": "error", "error": str(e)}
    
    def process_frame(self, exercise_type: str, landmarks_data: str) -> str:
        """Process a frame and return exercise detection results"""
        try:
            landmarks = json.loads(landmarks_data)
            
            if exercise_type.lower() == "push-ups":
                result = self.detect_push_ups(landmarks)
            elif exercise_type.lower() == "squats":
                result = self.detect_squats(landmarks)
            elif exercise_type.lower() == "punches":
                result = self.detect_punches(landmarks)
            else:
                result = {"error": "Unknown exercise type"}
                
            return json.dumps(result)
            
        except json.JSONDecodeError:
            return json.dumps({"error": "Invalid landmarks data"})
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    def process_image_file(self, image_path: str, exercise_type: str) -> str:
        """Process an image file and return exercise detection results"""
        try:
            # Read the image
            frame = cv2.imread(image_path)
            if frame is None:
                return json.dumps({"error": "Could not read image file"})
            
            # Process based on exercise type
            if exercise_type.lower() == "push-ups":
                result = self.detect_push_ups_simple(frame)
            elif exercise_type.lower() == "squats":
                result = self.detect_squats_simple(frame)
            elif exercise_type.lower() == "punches":
                result = self.detect_punches_simple(frame)
            else:
                result = {"error": "Unknown exercise type"}
                
            result["timestamp"] = int(cv2.getTickCount())
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({"error": f"Processing failed: {str(e)}"})
    
    def reset_counts(self):
        """Reset all exercise counts"""
        self.push_up_count = 0
        self.squat_count = 0
        self.punch_count = 0
        self.exercise_state = "up"
        self.punch_state = "ready"

if __name__ == "__main__":
    detector = ExerciseDetector()
    
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python exercise_detector.py <image_path> <exercise_type>"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    exercise_type = sys.argv[2]
    
    result = detector.process_image_file(image_path, exercise_type)
    print(result)
