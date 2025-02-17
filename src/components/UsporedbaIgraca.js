import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase";

/* eslint-disable jsx-a11y/accessible-emoji */

const UsporedbaIgraca = () => {
  const [players, setPlayers] = useState([]);
  const [playerOne, setPlayerOne] = useState(null);
  const [playerTwo, setPlayerTwo] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        const playersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersList);
      } catch (error) {
        console.error("❌ Greška pri dohvaćanju igrača:", error);
      }
    };

    fetchPlayers();
  }, []);

  const handleCompare = () => {
    if (!playerOne || !playerTwo) {
      alert("Odaberite oba igrača za usporedbu.");
      return;
    }
    
    setComparisonResult({
      goals: `${playerOne.goals || 0} ⚽ vs ⚽ ${playerTwo.goals || 0}`,
      assists: `${playerOne.assists || 0} 🎯 vs 🎯 ${playerTwo.assists || 0}`,
      matchesPlayed: `${playerOne.matchesPlayed || 0} 🏆 vs 🏆 ${playerTwo.matchesPlayed || 0}`,
      avgGoals: `${((playerOne.goals || 0) / (playerOne.matchesPlayed || 1)).toFixed(2)} ⚽/U vs ⚽/U ${((playerTwo.goals || 0) / (playerTwo.matchesPlayed || 1)).toFixed(2)}`,
      avgAssists: `${((playerOne.assists || 0) / (playerOne.matchesPlayed || 1)).toFixed(2)} 🎯/U vs 🎯/U ${((playerTwo.assists || 0) / (playerTwo.matchesPlayed || 1)).toFixed(2)}`,
    });
  };

  return (
    <div style={styles.container}>
      <h2>🔍 Usporedba Igrača</h2>

      <div style={styles.selectorContainer}>
        <select onChange={(e) => setPlayerOne(players.find(p => p.id === e.target.value))} style={styles.select}>
          <option value="">Odaberi igrača 1</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>

        <select onChange={(e) => setPlayerTwo(players.find(p => p.id === e.target.value))} style={styles.select}>
          <option value="">Odaberi igrača 2</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
      </div>

      <button onClick={handleCompare} style={styles.compareButton}>Usporedi</button>

      {comparisonResult && (
        <div style={styles.resultContainer}>
          <h3>📊 Rezultati usporedbe</h3>
          <p><strong>Golovi:</strong> {comparisonResult.goals}</p>
          <p><strong>Asistencije:</strong> {comparisonResult.assists}</p>
          <p><strong>Odigrane utakmice:</strong> {comparisonResult.matchesPlayed}</p>
          <p><strong>Prosjek golova po utakmici:</strong> {comparisonResult.avgGoals}</p>
          <p><strong>Prosjek asistencija po utakmici:</strong> {comparisonResult.avgAssists}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "20px auto",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  selectorContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "15px",
  },
  select: {
    flex: 1,
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  compareButton: {
    padding: "10px 15px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s ease-in-out",
  },
  resultContainer: {
    marginTop: "20px",
    padding: "15px",
    background: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
};

/* eslint-enable jsx-a11y/accessible-emoji */


export default UsporedbaIgraca;
