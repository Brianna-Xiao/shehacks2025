import React from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory

const VideoPlayer = () => {
  const navigate = useNavigate(); // Use navigate hook to navigate

  const navigateToNewPage = () => {
    navigate("/newpage"); // Navigate to the new page
  };

  return (
    <div>
      <div className="title">
        <img src="/Logo.png" alt="Logo" style={{ width: "200px" }} />
        <p>Learn the dance choreography below 👯‍♀️</p>
        <h3>Dance Choreo: TT by TWICE 💃✨</h3>
      </div>
      <video width="360" height="640" controls>
        <source src="/dance-movie.mp4" type="video/mp4" alt="missing" />
      </video>
      <button onClick={navigateToNewPage} style={buttonStyle}>
        Ready to Start
      </button>
    </div>
  );
};

const buttonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default VideoPlayer;
