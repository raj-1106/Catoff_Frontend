import React, { useState } from "react";
import "./App.css"; // Import the CSS file

const App = () => {
  const [steamId, setSteamId] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!steamId) {
      setError("Please enter a valid Steam ID.");
      return;
    }

    setError(null);
    setLoading(true);
    setStats(null);

    try {
      const res = await fetch(`https://catoff-backend.onrender.com/api/stats?steamid=${steamId}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setStats(data.data); // Assuming the API response contains `data`
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch stats. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const convertPlaytimeToHours = (minutes) => {
    if (!minutes || isNaN(minutes)) return "N/A"; // Handle invalid or missing playtime
    return (minutes / 60).toFixed(2) + " hours"; // Convert to hours and format
  };

  // Function to share stats on Twitter
  const shareOnTwitter = async () => {
    try {
      const response = await fetch("https://catoff-backend.onrender.com/share-on-twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamid: steamId }),
      });

      const data = await response.json();
      if (data.shareUrl) {
        window.open(data.shareUrl, "_blank");
      }
    } catch (error) {
      console.error("Error sharing on Twitter:", error);
    }
  };

  return (
    <div className="app-container">
      <h1>Player Stats For Counter-Strike 2</h1>

      <div className="form-container">
        <input
          className="input-field"
          type="text"
          placeholder="Enter Steam ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
        />
        <button
          className="submit-btn"
          onClick={fetchStats}
          disabled={loading}
        >
          Fetch Stats
        </button>
      </div>

      {loading && <p>Loading stats...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {stats && (
        <div className="response-container">
          <h2>Player Summary</h2>
          <p>Name: {stats.playerSummary?.personaname || "N/A"}</p>
          <p>
            Profile URL:{" "}
            <a
              href={stats.playerSummary?.profileurl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Profile
            </a>
          </p>

          <h2>Game Stats</h2>
          <ul>
            <li>Kills: {stats.gameStats?.kills || "N/A"}</li>
            <li>Deaths: {stats.gameStats?.deaths || "N/A"}</li>
            <li>
              Accuracy:{" "}
              {stats.gameStats?.accuracy
                ? `${stats.gameStats.accuracy}%`
                : "N/A"}
            </li>
            <li>
              Kill/Death Ratio:{" "}
              {stats.gameStats?.kills && stats.gameStats?.deaths
                ? (stats.gameStats.kills / stats.gameStats.deaths).toFixed(2)
                : "N/A"}
            </li>
            <li>Damage Done: {stats.gameStats?.damage_done || "N/A"}</li>
            <li>Shots Fired: {stats.gameStats?.shots_fired || "N/A"}</li>
            <li>Playtime: {convertPlaytimeToHours(stats.gameStats?.playtime)}</li>
          </ul>

          {/* Twitter share button */}
          <button className="submit-btn" onClick={shareOnTwitter}>
            Share Stats on Twitter
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
