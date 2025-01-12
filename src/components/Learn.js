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
      </div>
      <video width="340" height="500" controls>
        <source src="/dance-movie.mp4" type="video/mp4" alt="missing" />
      </video>
      <button onClick={navigateToNewPage}>
        Ready to Start
      </button>
    </div>
  );
};

export default VideoPlayer;
