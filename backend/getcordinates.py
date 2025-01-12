import cv2
import mediapipe as mp
import json
import time
from math import atan2, degrees
import os

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

VISIBILITY_THRESHOLD = .8  # Amount of certainty that a body landmark is visible

# Function to calculate the angle between three points
def calculate_angle(a, b, c):
    angle = degrees(atan2(c[1] - b[1], c[0] - b[0]) - atan2(a[1] - b[1], a[0] - b[0]))
    return angle + 360 if angle < 0 else angle

# Open webcam
cap = cv2.VideoCapture(0)

# Metadata storage
metadata = []
start_time = time.time()
last_recorded_time = start_time  # Track when we last recorded data

# Get the current file's directory (backend folder)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up one level to the project root and then into the public folder
public_folder = os.path.abspath(os.path.join(current_dir, "..", "public"))

# Ensure the public folder exists
if not os.path.exists(public_folder):
    os.makedirs(public_folder)
    print(f"Created public folder at: {public_folder}")

output_file = os.path.join(public_folder, "pose_metadata.json")
print(f"Output file path: {output_file}")

try:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Get the current timestamp relative to the start
        timestamp = time.time() - start_time

        # Convert frame to RGB for MediaPipe processing
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        if results.pose_landmarks:
            # Extract landmark coordinates
            landmarks = results.pose_landmarks.landmark

            # Define the key joints for angle calculation
            key_joints = {
                "left_elbow": [11, 13, 15],  # Left Shoulder, Left Elbow, Left Wrist
                "right_elbow": [12, 14, 16],  # Right Shoulder, Right Elbow, Right Wrist
                "left_shoulder": [13, 11, 23],  # Left Elbow, Left Shoulder, Left Hip
                "right_shoulder": [14, 12, 24],  # Right Elbow, Right Shoulder, Right Hip
                "left_knee": [23, 25, 27],  # Left Hip, Left Knee, Left Ankle
                "right_knee": [24, 26, 28],  # Right Hip, Right Knee, Right Ankle
            }

            # Draw landmarks on the frame
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            current_time = time.time()
            
            # Only record data every 0.5 seconds
            if current_time - last_recorded_time >= 0.5:
                timestamp = current_time - start_time
                frame_data = {"timestamp": round(timestamp, 2), "angles": {}}

                # Calculate and store angles for recording
                for name, (i1, i2, i3) in key_joints.items():
                    a = [landmarks[i1].x, landmarks[i1].y]
                    b = [landmarks[i2].x, landmarks[i2].y]
                    c = [landmarks[i3].x, landmarks[i3].y]
                    angle = calculate_angle(a, b, c)
                    frame_data["angles"][name] = round(angle, 2)

                # Append the frame data to the metadata list
                metadata.append(frame_data)
                last_recorded_time = current_time

            # Display angles on video (happens every frame for smooth display)
            for name, (i1, i2, i3) in key_joints.items():
                a = [landmarks[i1].x, landmarks[i1].y]
                b = [landmarks[i2].x, landmarks[i2].y]
                c = [landmarks[i3].x, landmarks[i3].y]
                angle = calculate_angle(a, b, c)

                # Get the pixel coordinates of the middle joint
                joint_x = int(landmarks[i2].x * frame.shape[1])
                joint_y = int(landmarks[i2].y * frame.shape[0])

                # Display the angle near the joint
                cv2.putText(frame, f"{name}: {int(angle)} degrees", (joint_x, joint_y - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2, cv2.LINE_AA)

        # Show the frame with annotations
        cv2.imshow("Pose Estimation with Angles", frame)

        # Exit on 'ESC' key
        if cv2.waitKey(10) & 0xFF == 27:
            print("ESC pressed, exiting...")
            break

except KeyboardInterrupt:
    print("Script interrupted by user (Ctrl + C). Saving data...")

finally:
    cap.release()
    cv2.destroyAllWindows()

    # Save metadata to JSON file in the public folder
    try:
        with open(output_file, "w") as f:
            json.dump(metadata, f, indent=4)
        print(f"Pose metadata saved to {output_file}")
    except Exception as e:
        print(f"Error saving JSON file: {e}")
        