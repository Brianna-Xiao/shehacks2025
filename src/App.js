import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VideoPlayer from "./components/Learn";
import Record from "./components/Record";
import Compare from "./components/Compare"; // Import the Compare component

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the Learn.js page */}
        <Route path="/" element={<VideoPlayer />} />
        {/* Route for the Record.js page */}
        <Route path="/newpage" element={<Record />} />
        {/* Route for the Compare component */}
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </Router>
  );
}

export default App;
