import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase";
import { useHistory } from "react-router-dom";
import "../App.css";

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
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

    fetchMatches();
    fetchPlayers();
  }, []);

  // Funkcija za nasumični nogometni GIF
  const getRandomFootballMeme = () => {
    const memes = [
      "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExajF0NGI5N2NjMHJmNW0xbG1qbW52NTBkcXJlamxlczJqMmVpbGlnOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kxUhZ0TY46X1Dk48ru/giphy.gif", 
      "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjZrcTlvbzM2ZmZkempoM2lrM3g2dzVkcjB2NHM4dGhsNmhyMjVvcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/i8Udr19doZnqEQTPxu/giphy.gif", 
      "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpiOGozazk4a3Vndmlsa2l1b3NxY2gzNnNxeWlseG95dTd4ZzZ4aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8TY5Uw0CNztcwYuP1t/giphy.gif",  
      "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDg2NzFiMmFjZzNiYWl4eWZ3cWlld3BlcHgybjFiejg4YjJmOTBpciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dyuc5DfSUg1RGg8P3p/giphy.gif", 
    ];
    return memes[Math.floor(Math.random() * memes.length)];
  };

  // Kada se klikne na igrača, postavljamo novog igrača i novi GIF
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setRandomGif(getRandomFootballMeme());
  };

  return (
    <div className="container">
      {/* UTAMICE */}
      <h2>
        <span role="img" aria-label="calendar">📅</span> Nadolazeće i Odigrane Utakmice
      </h2>
      <ul className="match-list">
        {matches.length > 0 ? (
          matches.map((match) => (
            <li key={match.id} className="match-item" onClick={() => history.push(`/match/${match.id}`)}>
              <p><strong>{match.date} - {match.time}</strong></p>
              <p>
                {match.teamA?.join(", ")}
                <span role="img" aria-label="versus"> 🆚 </span>
                {match.teamB?.join(", ")}
              </p>
              <p><span role="img" aria-label="location">📍</span> Lokacija: {match.location}</p>
              <p><span role="img" aria-label="score">⚽</span> Rezultat: {match.scoreA} - {match.scoreB}</p>
            </li>
          ))
        ) : (
          <p>Nema dostupnih utakmica.</p>
        )}
      </ul>

      {/* LISTA IGRAČA */}
      <h2>
        <span role="img" aria-label="players">👥</span> Lista Igrača
      </h2>
      <ul className="player-list">
        {players.length > 0 ? (
          players.map((player) => (
            <li key={player.id} className="player-item" onClick={() => handlePlayerClick(player)}>
              <p>{player.name}</p>
            </li>
          ))
        ) : (
          <p>Nema dostupnih igrača.</p>
        )}
      </ul>

      {/* PRIKAZ STATISTIKE IGRAČA */}
      {selectedPlayer && (
        <div className="player-stats">
          <h3>{selectedPlayer.name} - Statistika</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span role="img" aria-label="goal">⚽</span>
              <h3>{selectedPlayer.goals || 0}</h3>
              <p>Golovi</p>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="assist">🎯</span>
              <h3>{selectedPlayer.assists || 0}</h3>
              <p>Asistencije</p>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="games">🏆</span>
              <h3>{selectedPlayer.matchesPlayed || 0}</h3>
              <p>Odigrane Utakmice</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span role="img" aria-label="average-goals">📊</span>
              <h3>{((selectedPlayer.goals || 0) / (selectedPlayer.matchesPlayed || 1)).toFixed(2)}</h3>
              <p>Prosjek golova po utakmici</p>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="average-assists">📊</span>
              <h3>{((selectedPlayer.assists || 0) / (selectedPlayer.matchesPlayed || 1)).toFixed(2)}</h3>
              <p>Prosjek asistencija po utakmici</p>
            </div>
          </div>

          {/* RANDOM GIF */}
          <div className="meme-container">
            
            <img src={randomGif} alt="Football Meme" className="meme-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
