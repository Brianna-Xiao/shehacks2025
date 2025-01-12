import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const Record = () => {
  const videoRef = useRef(null); // Ref for the dance video
  const webcamRef = useRef(null); // Ref for the webcam video
  const mediaRecorderRef = useRef(null); // Ref for the MediaRecorder instance
  const [recording, setRecording] = useState(false); // State to track recording status
  const [recordedChunks, setRecordedChunks] = useState([]); // To store video data
  const [backendStatus, setBackendStatus] = useState("stopped"); // State to track backend status

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      webcamRef.current.srcObject = stream; // Attach the stream to the webcam video
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  };

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5001/status");
      setBackendStatus(response.data.status);
    } catch (error) {
      console.error("Failed to check backend status:", error);
    }
  };

  // Start recording and play the dance video
  const startRecording = async () => {
    // Start the backend server
    try {
      const response = await axios.post("http://127.0.0.1:5001/start-processing");
      console.log(response.data.message);
      setBackendStatus("running");
    } catch (error) {
      console.error("Failed to start backend processing:", error);
      alert("Failed to start backend processing. Please try again.");
      return;
    }

    // Original recording logic
    const stream = webcamRef.current.srcObject;
    if (!stream) {
      console.error("Webcam stream is not initialized.");
      return;
    }

    setRecording(true);
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    // Collect video data chunks
    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    // Handle when the recording stops
    mediaRecorder.onstop = () => {
      setRecordedChunks(chunks);
      const videoBlob = new Blob(chunks, { type: "video/mp4" });
      const videoURL = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = videoURL;
      a.download = "recorded-video.mp4";
      a.click();
    };

    mediaRecorder.start(); // Start recording

    // Explicitly play the dance video
    videoRef.current.play().catch((error) => {
      console.error("Error playing dance video:", error);
    });

    // Explicitly play the webcam video
    webcamRef.current.play().catch((error) => {
      console.error("Error playing webcam video:", error);
    });
  };

  // Stop recording without stopping the webcam stream
  const stopRecording = async () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Stop the backend processing
    try {
      const response = await axios.post("http://127.0.0.1:5001/stop-processing");
      console.log(response.data.message);
      setBackendStatus("stopped");
    } catch (error) {
      console.error("Failed to stop backend processing:", error);
      alert("Failed to stop backend processing. Please try again.");
    }
  };

  // Handle when the dance video ends
  const handleVideoEnd = () => {
    if (recording) {
      stopRecording(); // Automatically stop recording when the video ends
    }
  };

  // Initialize webcam and check backend status on component mount
  useEffect(() => {
    startWebcam();
    checkBackendStatus();
    return () => {
      const stream = webcamRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div style={videoContainerStyle}>
        {/* Dance video on the left */}
        <div style={danceVideoStyle}>
          <video
            ref={videoRef}
            width="360"
            height="640"
            controls
            onEnded={handleVideoEnd} // Trigger when the video ends
            style={{ borderRadius: "10px" }}
          >
            <source src="/dance-movie.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Webcam view and recording on the right */}
        <div style={webcamStyle}>
          <video
            ref={webcamRef}
            muted
            playsInline
            style={{ width: "100%", height: "100%", borderRadius: "10px" }}
          ></video>
          <div style={buttonContainerStyle}>
            {recording ? (
              <button onClick={stopRecording} style={stopButtonStyle}>
                Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                style={recordButtonStyle}
                disabled={backendStatus === "running"}
              >
                Start Recording
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add the missing CSS styles here
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100vh",
  backgroundColor: "#f4f4f4",
};

const videoContainerStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "80%",
  height: "70%",
  gap: "20px",
};

const danceVideoStyle = {
  flex: 1,
  backgroundColor: "#ddd",
  borderRadius: "10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const webcamStyle = {
  flex: 1,
  position: "relative",
  backgroundColor: "#ddd",
  borderRadius: "10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const buttonContainerStyle = {
  position: "absolute",
  bottom: "20px",
  textAlign: "center",
};

const recordButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
};

const stopButtonStyle = {
  ...recordButtonStyle,
  backgroundColor: "#FF0000",
};

export default Record;