import cv2
import mediapipe as mp
import json
import time
from math import atan2, degrees

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

            # Store angle data for the current frame
            frame_data = {"timestamp": round(timestamp, 2), "angles": {}}

            # Calculate and display angles for the defined key joints
            for name, (i1, i2, i3) in key_joints.items():
                # Get coordinates for the three points
                a = [landmarks[i1].x, landmarks[i1].y]
                b = [landmarks[i2].x, landmarks[i2].y]
                c = [landmarks[i3].x, landmarks[i3].y]

                # Calculate angle
                angle = calculate_angle(a, b, c)

                # Store the angle in frame data
                frame_data["angles"][name] = round(angle, 2)

                # Get the pixel coordinates of the middle joint (e.g., elbow for elbow angles)
                joint_x = int(landmarks[i2].x * frame.shape[1])
                joint_y = int(landmarks[i2].y * frame.shape[0])

                # Display the angle near the joint
                cv2.putText(frame, f"{name}: {int(angle)} degrees", (joint_x, joint_y - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2, cv2.LINE_AA)

            # Append the frame data to the metadata list
            metadata.append(frame_data)

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

    # Save metadata to JSON file
    try:
        with open("pose_metadata.json", "w") as f:
            json.dump(metadata, f, indent=4)
        print("Pose metadata saved to pose_metadata.json")
    except Exception as e:
        print(f"Error saving JSON file: {e}")
