import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Record = () => {
  const videoRef = useRef(null); // Ref for the dance video
  const webcamRef = useRef(null); // Ref for the webcam video
  const mediaRecorderRef = useRef(null); // Ref for the MediaRecorder instance
  const [recording, setRecording] = useState(false); // State to track recording status
  const navigate = useNavigate(); // Hook for navigation

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      webcamRef.current.srcObject = stream; // Attach the stream to the webcam video
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  };

  // Start recording
  const startRecording = () => {
    const stream = webcamRef.current.srcObject;
    if (!stream) {
      console.error("Webcam stream is not initialized.");
      return;
    }

    setRecording(true);
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.onstop = () => {
      // Navigate to Compare.js after recording stops
      navigate("/compare");
    };

    mediaRecorder.start();
    videoRef.current.play().catch((error) => {
      console.error("Error playing dance video:", error);
    });
  };

  // Stop recording
  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle when the dance video ends
  const handleVideoEnd = () => {
    if (recording) {
      stopRecording(); // Stop recording when the video ends
    }
  };

  // Auto-start the webcam on component mount
  React.useEffect(() => {
    startWebcam();
    return () => {
      const stream = webcamRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        {/* Dance video on the left */}
        <video
          ref={videoRef}
          controls
          onEnded={handleVideoEnd} // Trigger stopRecording when video ends
          style={danceVideoStyle}
        >
          <source src="/dance-movie-moves.mp4" type="video/mp4" />
        </video>

        {/* Webcam video on the right */}
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          muted
          style={webcamStyle}
        ></video>
      </div>
      {/* Start/Stop recording button */}
      <div style={buttonContainerStyle}>
        {recording ? (
          <button onClick={stopRecording} style={stopButtonStyle}>
            Stop Recording
          </button>
        ) : (
          <button onClick={startRecording} style={recordButtonStyle}>
            Start Recording
          </button>
        )}
      </div>
    </div>
  );
};

// CSS Styles
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100vh",
  backgroundColor: "transparent",
};

const contentWrapperStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  maxWidth: "3000px",
  gap: "20px",
};

const danceVideoStyle = {
  width: "30%",
  maxHeight: "520px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

const webcamStyle = {
  width: "85%",
  maxHeight: "550px",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

const buttonContainerStyle = {
  marginTop: "20px",
  textAlign: "center",
};

const recordButtonStyle = {
  padding: "15px 30px",
  backgroundColor: "#ffffff",
  color: "#a97dd4",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "1.2em",
  fontWeight: "bold",
  transition: "background-color 0.3s ease, transform 0.2s ease",
};

const stopButtonStyle = {
  ...recordButtonStyle,
  backgroundColor: "#FF0000",
};

export default Record;
