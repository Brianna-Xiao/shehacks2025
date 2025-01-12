import cv2
import mediapipe as mp

# Initialize MediaPipe Holistic and Drawing Utils
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Open webcam feed
cap = cv2.VideoCapture(0)

# Check if the camera is opened successfully
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

# Set up the Holistic model
with mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
) as holistic:
    while True:
        ret, frame = cap.read()

        if not ret:
            print("Error: Failed to capture frame.")
            break

        # Flip the image horizontally for a mirror-like view
        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process the frame with MediaPipe Holistic
        results = holistic.process(frame_rgb)

        # Draw pose landmarks
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_holistic.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=4),  # Landmarks
                mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)  # Connections
            )

        # Draw left hand landmarks
        if results.left_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.left_hand_landmarks,
                mp_holistic.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(80, 22, 10), thickness=2, circle_radius=4),  # Landmarks
                mp_drawing.DrawingSpec(color=(80, 44, 121), thickness=2, circle_radius=2)  # Connections
            )

        # Draw right hand landmarks
        if results.right_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.right_hand_landmarks,
                mp_holistic.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(80, 22, 10), thickness=2, circle_radius=4),  # Landmarks
                mp_drawing.DrawingSpec(color=(80, 44, 121), thickness=2, circle_radius=2)  # Connections
            )

        # Draw face landmarks using FACEMESH_TESSELATION
        if results.face_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.face_landmarks,
                mp_holistic.FACEMESH_TESSELATION,  # Draw face mesh
                mp_drawing.DrawingSpec(color=(80, 110, 10), thickness=1, circle_radius=1),  # Landmarks
                mp_drawing.DrawingSpec(color=(80, 256, 121), thickness=1, circle_radius=1)  # Connections
            )

        # Display the frame
        cv2.imshow("Holistic Model - Stick Figure", frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Release the resources
cap.release()
cv2.destroyAllWindows()
