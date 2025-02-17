import React, { useState, useEffect, useCallback } from 'react';
import { db, collection, getDocs } from '../firebase';
import '../App.css';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [sortType, setSortType] = useState('points'); // Defaultno sortiranje po bodovima
  const [mvp, setMvp] = useState(null);

  useEffect(() => {
    const fetchPlayersAndMatches = async () => {
      try {
        const playersSnapshot = await getDocs(collection(db, "players"));
        const matchesSnapshot = await getDocs(collection(db, "matches"));

        const playersData = playersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          wins: 0,
          draws: 0,
          losses: 0,
          matchesPlayed: 0,
          points: 0,
          goalDifference: 0,
          successRate: "0%",
          successPoints: 0,
        }));

        const matchesData = matchesSnapshot.docs.map(doc => doc.data());

        // Izračunaj statistiku na temelju utakmica
        const updatedPlayers = calculateStats(playersData, matchesData);
        setPlayers(updatedPlayers);
      } catch (error) {
        console.error("❌ Greška pri dohvaćanju igrača i utakmica:", error);
      }
    };

    fetchPlayersAndMatches();
  }, []);

  const calculateStats = (playersList, matchesList) => {
    return playersList.map(player => {
        let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
        let matchesPlayed = 0; // ✅ Brojat će se svi igrači koji su igrali

        matchesList.forEach(match => {
            if (!match.teamA || !match.teamB) {
                console.warn(`⚠ Upozorenje: Utakmica bez timova! (ID: ${match.id})`);
                return;
            }

            const isInTeamA = match.teamA.includes(player.name);
            const isInTeamB = match.teamB.includes(player.name);
            
            if (isInTeamA || isInTeamB) {
                matchesPlayed++; // ✅ Svaka utakmica se broji, čak i ako nema golova/asistencija

                let isTeamA = isInTeamA;
                let teamGoals = isTeamA ? match.scoreA : match.scoreB;
                let opponentGoals = isTeamA ? match.scoreB : match.scoreA;

                goalsFor += teamGoals;
                goalsAgainst += opponentGoals;

                if (teamGoals > opponentGoals) wins++;
                else if (teamGoals < opponentGoals) losses++;
                else draws++;
            }
        });

        console.log(`📌 ${player.name} - Odigrane utakmice: ${matchesPlayed}`);

        const successRate = matchesPlayed > 0 ? ((wins / matchesPlayed) * 100).toFixed(1) + "%" : "0%";
        const points = wins * 3 + draws;
        const successPoints = ((parseFloat(successRate) / 100) * points).toFixed(1);

        return {
            ...player,
            wins,
            draws,
            losses,
            matchesPlayed, // ✅ Svi igrači sada imaju tačan broj utakmica
            points,
            goalsFor,
            goalsAgainst,
            goalDifference: goalsFor - goalsAgainst,
            successRate,
            successPoints,
        };
    });
};



  const sortLeaderboard = useCallback((playersList, type) => {
    const sorted = [...playersList].sort((a, b) => (b[type] || 0) - (a[type] || 0));
    setSortedPlayers(sorted);
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      sortLeaderboard(players, sortType);
      findMVP(players);
    }
  }, [players, sortType, sortLeaderboard]);

  const findMVP = (playersList) => {
    if (playersList.length === 0) return;

    let bestMvp = null;
    let maxMvpPoints = -1;

    playersList.forEach(player => {
        let mvpPoints = (player.goals || 0) * 5 + (player.assists || 0) * 3 + (player.wins || 0) * 2;

        if (mvpPoints > maxMvpPoints) {
            maxMvpPoints = mvpPoints;
            bestMvp = player;
        }
    });

    setMvp(bestMvp);
};


  return (
    <div className="leaderboard-container">
      <h2>
        <span role="img" aria-label="trophy">🏆</span> Rang Lista Igrača
      </h2>
  
      {/* MVP SEZONE */}
{mvp && (
  <div className="mvp-box">
    <h3>
      MVP Sezone: {mvp.name} - {((mvp.goals || 0) * 5 + (mvp.assists || 0) * 3 + (mvp.wins || 0) * 2)} POINTS
      <span role="img" aria-label="medal"> 🥇</span>
    </h3>
  </div>
)}
  
      {/* SORTIRANJE */}
      <div className="sort-buttons">
        <button onClick={() => setSortType('points')}>Sortiraj po Bodovima</button>
        <button onClick={() => setSortType('successPoints')}>Sortiraj po Uspješnost x Bodovi</button>
        <button onClick={() => setSortType('successRate')}>Sortiraj po Uspješnosti</button>
        <button onClick={() => setSortType('goalDifference')}>Sortiraj po Gol Razlici</button>
      </div>
  
      {/* WRAPPER ZA VODORAVNI SCROLL */}
      <div style={{ overflowX: "auto" }}>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Igrač</th>
              <th>Golovi</th>
              <th>Asistencije</th>
              <th>Uspješnost x Bodovi</th>
              <th>Uspješnost</th>
              <th>Bodovi</th>
              <th>Gol Razlika</th>
              <th>Post. Golovi</th>
              <th>Prim. Golovi</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>P</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.length > 0 ? (
              sortedPlayers.map((player, index) => (
                <tr key={player.id}>
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.goals || 0}</td>
                  <td>{player.assists || 0}</td>
                  <td>{player.successPoints || 0}</td>
                  <td>{player.successRate || "0%"}</td>
                  <td>{player.points || 0}</td>
                  <td>{player.goalDifference || 0}</td> {/* ✅ Gol razlika - Sada mora raditi */}
                  <td>{player.goalsFor || 0}</td> {/* ✅ Postignuti golovi */}
                  <td>{player.goalsAgainst || 0}</td> {/* ✅ Primljeni golovi */}
                  <td>{player.wins || 0}</td>
                  <td>{player.draws || 0}</td>
                  <td>{player.losses || 0}</td>
                  <td>{player.matchesPlayed || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15">Nema dostupnih podataka</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
