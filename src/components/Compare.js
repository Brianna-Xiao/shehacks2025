import React, { useEffect, useState } from "react";

function Compare() {
  const [refData, setRefData] = useState([]);
  const [poseData, setPoseData] = useState([]);
  const [matchedFrames, setMatchedFrames] = useState([]);
  const [totalScore, setTotalScore] = useState(null);

  const calculatePoints = (refAngles, matchedAngles) => {
    let points = 0;
    for (const [joint, refAngle] of Object.entries(refAngles)) {
      const matchedAngle = matchedAngles[joint];
      if (matchedAngle >= refAngle * 0.8 && matchedAngle <= refAngle * 1.2) {
        points++;
      }
    }
    return points;
  };

  useEffect(() => {
    const loadData = async () => {
      const refResponse = await fetch("/refData.json");
      const poseResponse = await fetch("/pose_metadata.json");
      const refJson = await refResponse.json();
      const poseJson = await poseResponse.json();

      setRefData(refJson);
      setPoseData(poseJson);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (refData.length && poseData.length) {
      const matches = refData.map((refFrame) => {
        const refTime = refFrame.timestamp;
        let closestFrame = poseData[0];
        let smallestDiff = Math.abs(refTime - poseData[0].timestamp);

        poseData.forEach((poseFrame) => {
          const diff = Math.abs(refTime - poseFrame.timestamp);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestFrame = poseFrame;
          }
        });

        return {
          refAngles: refFrame.angles,
          matchedAngles: closestFrame.angles,
        };
      });

      setMatchedFrames(matches);

      // Calculate total score
      const score = matches.reduce((total, frame) => {
        return total + calculatePoints(frame.refAngles, frame.matchedAngles);
      }, 0);

      const maxPossibleScore =
        matches.length * Object.keys(matches[0]?.refAngles || {}).length;
      setTotalScore({ score, maxPossibleScore });
    }
  }, [refData, poseData]);

  return (
    <div>
      {totalScore && (
        <>
          <h1>Final Score: {totalScore.score} / {totalScore.maxPossibleScore}</h1>
          <div style={emojiContainerStyle}>
            {matchedFrames.map((frame, index) => {
              const frameScore = calculatePoints(frame.refAngles, frame.matchedAngles);
              let emoji;
              if (frameScore > 3) {
                emoji = "😊"; // Smiley face for scores above 3
              } else if (frameScore < 3) {
                emoji = "😢"; // Crying face for scores below 3
              } else {
                emoji = "😐"; // Neutral face for scores exactly 3
              }
              return (
                <span key={index} style={emojiStyle}>
                  {emoji}
                </span>
              );
            })}
          </div>
          {/* Legend for emojis */}
          <div style={legendStyle}>
            <p>
              <span style={legendEmojiStyle}>😊</span> = Checkpoint Passed
            </p>
            <p>
              <span style={legendEmojiStyle}>😢</span> = Checkpoint Failed
            </p>
            <p>
              <span style={legendEmojiStyle}>😐</span> = Decent Attempt
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// CSS Styles
const emojiContainerStyle = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  fontSize: "2em",
};

const emojiStyle = {
  padding: "0 5px",
};

const legendStyle = {
  marginTop: "20px",
  textAlign: "center",
  fontSize: "1.2em",
  fontFamily: "Calibri, sans-serif",
  color: "#ffffff",
};

const legendEmojiStyle = {
  fontSize: "1.5em",
};

export default Compare;
