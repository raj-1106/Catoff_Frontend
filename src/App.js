import React, { useState } from "react";
import './App.css'; // Import the CSS file

function App() {
  const [steamID64, setSteamID64] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://catoff-backend.vercel.app/fetch-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamID64 }),
      });
      const data = await res.json();
      setResponse(data.data || { message: data.message });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setResponse({ message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const shareOnTwitter = async (gameName, achievement) => {
    try {
      const res = await fetch("https://catoff-backend.vercel.app/share-on-twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          gameName, 
          achievement: achievement.name, 
          proofUrl: "YourProofURLHere" 
        }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        window.open(data.shareUrl, "_blank");
      }
    } catch (error) {
      console.error("Error sharing on Twitter:", error);
    }
  };

  return (
    <div className="app-container">
      <h1>Gamer Stats Fetcher</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <label className="input-label">
          Enter SteamID64:
          <input
            type="text"
            value={steamID64}
            onChange={(e) => setSteamID64(e.target.value)}
            required
            className="input-field"
          />
        </label>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Fetching..." : "Fetch Stats"}
        </button>
      </form>
      {response && (
        <div className="response-container">
          <h2>Fetched Data:</h2>
          <pre>
            {response.games
              ? response.games.map((game, index) => (
                  <div key={index} className="game-card">
                    <h3>{game.name}</h3>
                    <p>Achievements:</p>
                    <ul>
                      {Array.isArray(game.achievements) &&
                        game.achievements.map((ach, i) => (
                          <li key={i}>
                            {ach.name || "Unnamed Achievement"} - {ach.achieved}
                            <button 
                              onClick={() => shareOnTwitter(game.name, ach)} 
                              className="share-btn"
                            >
                              Share on X
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))
              : response.message}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
