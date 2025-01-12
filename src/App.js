import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VideoPlayer from "./components/Learn";
import Record from "./components/Record"; // Update the component name

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the Learn.js page */}
        <Route path="/" element={<VideoPlayer />} />
        {/* Route for the Record.js page */}
        <Route path="/newpage" element={<Record />} />
      </Routes>
    </Router>
  );
}

export default App;