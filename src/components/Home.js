
import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase";
import { useHistory } from "react-router-dom";

/* eslint-disable jsx-a11y/accessible-emoji */

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playersSeason1, setPlayersSeason1] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [randomGif, setRandomGif] = useState("");

  const history = useHistory();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "matches"));
        const matchList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        matchList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMatches(matchList);
      } catch (error) {
        console.error("❌ Greška pri dohvaćanju utakmica:", error);
      }
    };

    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        const playersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlayers(playersList);
      } catch (error) {
        console.error("❌ Greška pri dohvaćanju igrača:", error);
      }
    };

    const fetchSeason1Players = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players_sezona1"));
        const playerList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayersSeason1(playerList);
      } catch (error) {
        console.error("❌ Greška pri dohvaćanju arhive igrača:", error);
      }
    };

    fetchMatches();
    fetchPlayers();
    fetchSeason1Players();
  }, []);

  const getRandomFootballMeme = () => {
    const memes = [
      "https://media1.giphy.com/media/kxUhZ0TY46X1Dk48ru/giphy.gif",
      "https://media4.giphy.com/media/i8Udr19doZnqEQTPxu/giphy.gif",
      "https://media0.giphy.com/media/8TY5Uw0CNztcwYuP1t/giphy.gif",
      "https://media0.giphy.com/media/dyuc5DfSUg1RGg8P3p/giphy.gif",
    ];
    return memes[Math.floor(Math.random() * memes.length)];
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setRandomGif(getRandomFootballMeme());
  };

  const scrollToArchive = () => {
    const archiveSection = document.getElementById('archive');
    if (archiveSection) {
      archiveSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "auto",
      padding: "20px",
    },
    matchGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "10px",
    },
    matchCard: {
      background: "white",
      padding: "10px",
      borderRadius: "8px",
      boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      cursor: "pointer",
      fontSize: "14px",
    },
    playerGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: "8px",
    },
    playerCard: {
      background: "white",
      padding: "8px",
      borderRadius: "8px",
      boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      cursor: "pointer",
      fontSize: "12px",
    },
    statsGrid: {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
    },
    statCard: {
      background: "white",
      padding: "12px",
      borderRadius: "8px",
      boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      flex: 1,
      minWidth: "100px",
    },
    memeContainer: {
      textAlign: "center",
      marginTop: "10px",
    },
    memeImage: {
      maxWidth: "100%",
      height: "auto",
      borderRadius: "8px",
    },
    archiveButton: {
      marginTop: "20px",
      padding: "10px 20px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    },
    leaderboardTable: {
      width: "100%",
      minWidth: "1200px",
      overflowX: "auto",
      marginTop: "30px",
      borderCollapse: "collapse",
    },
    leaderboardContainer: {
      overflowX: "auto",
    },
  };

  return (
    <div style={styles.container}>
      <h2>🏟 Dobrodošli na Nogometnu Aplikaciju</h2>
      <button style={styles.archiveButton} onClick={scrollToArchive}>
        📚 Pogledaj Arhivu Sezona
      </button>

      <h2>📅 Nadolazeće i Odigrane Utakmice</h2>
      <div style={styles.matchGrid}>
        {matches.length > 0 ? (
          matches.map((match) => (
            <div
              key={match.id}
              style={styles.matchCard}
              onClick={() => history.push(`/match/${match.id}`)}
            >
              <p><strong>{match.date} - {match.time}</strong></p>
              <p>{match.teamA?.join(", ")} 🆚 {match.teamB?.join(", ")}</p>
              <p>📍 {match.location}</p>
              <p>⚽ {match.scoreA} - {match.scoreB}</p>
            </div>
          ))
        ) : (
          <p>Nema dostupnih utakmica.</p>
        )}
      </div>

      <h2>👥 Lista Igrača</h2>
      <div style={styles.playerGrid}>
        {players.length > 0 ? (
          players.map((player) => (
            <div
              key={player.id}
              style={styles.playerCard}
              onClick={() => handlePlayerClick(player)}
            >
              <p>{player.name}</p>
            </div>
          ))
        ) : (
          <p>Nema dostupnih igrača.</p>
        )}
      </div>

      {selectedPlayer && (
        <div>
          <h3>{selectedPlayer.name} - Statistika</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span>⚽</span>
              <h3>{selectedPlayer.goals || 0}</h3>
              <p>Golovi</p>
            </div>
            <div style={styles.statCard}>
              <span>🎯</span>
              <h3>{selectedPlayer.assists || 0}</h3>
              <p>Asistencije</p>
            </div>
            <div style={styles.statCard}>
              <span>🏆</span>
              <h3>{selectedPlayer.matchesPlayed || 0}</h3>
              <p>Odigrane Utakmice</p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span>📊</span>
              <h3>
                {((selectedPlayer.goals || 0) / (selectedPlayer.matchesPlayed || 1)).toFixed(2)}
              </h3>
              <p>Prosjek golova po utakmici</p>
            </div>
            <div style={styles.statCard}>
              <span>📊</span>
              <h3>
                {((selectedPlayer.assists || 0) / (selectedPlayer.matchesPlayed || 1)).toFixed(2)}
              </h3>
              <p>Prosjek asistencija po utakmici</p>
            </div>
          </div>

          <div style={styles.memeContainer}>
            <img src={randomGif} alt="Football Meme" style={styles.memeImage} />
          </div>
        </div>
      )}

      {/* 📚 Arhiva Sezona 1 */}
      <div id="archive" style={{ marginTop: '60px' }}>
        <h2>📚 Arhiva Sezona 1</h2>
        <div style={styles.leaderboardContainer}>
          <table style={styles.leaderboardTable}>
            <thead>
              <tr>
                <th>#</th><th>Igrač</th><th>Golovi</th><th>Asistencije</th><th>Uspješnost x Bodovi</th><th>Uspješnost</th><th>Bodovi</th><th>Gol Razlika</th><th>Post. Golovi</th><th>Prim. Golovi</th><th>W</th><th>D</th><th>L</th><th>P</th>
              </tr>
            </thead>
            <tbody>
              {playersSeason1.length > 0 ? (
                playersSeason1
                  .sort((a, b) => (b.points || 0) - (a.points || 0))
                  .map((player, index) => (
                    <tr key={player.id}>
                      <td>{index + 1}</td>
                      <td>{player.name}</td>
                      <td>{player.goals || 0}</td>
                      <td>{player.assists || 0}</td>
                      <td>{player.successPoints || 0}</td>
                      <td>{player.successRate || "0%"}</td>
                      <td>{player.points || 0}</td>
                      <td>{player.goalDifference || 0}</td>
                      <td>{player.goalsFor || 0}</td>
                      <td>{player.goalsAgainst || 0}</td>
                      <td>{player.wins || 0}</td>
                      <td>{player.draws || 0}</td>
                      <td>{player.losses || 0}</td>
                      <td>{player.matchesPlayed || 0}</td>
                    </tr>
                  ))
              ) : (
                <tr><td colSpan="14">Nema arhiviranih podataka.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* eslint-enable jsx-a11y/accessible-emoji */

export default Home;
