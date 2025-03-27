// ✅ Leaderboard.js (IZMIJENJENO)
import React, { useState, useEffect, useCallback } from 'react';
import { db, collection, getDocs } from '../firebase';
import '../App.css';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [sortType, setSortType] = useState('points');
  const [dayFilter, setDayFilter] = useState("sve");
  const [mvp, setMvp] = useState(null);

  useEffect(() => {
    const applyFilter = async () => {
      try {
        const playersSnapshot = await getDocs(collection(db, "players"));
        const matchesSnapshot = await getDocs(collection(db, "matches"));

        const playersData = playersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const matchesData = matchesSnapshot.docs.map(doc => doc.data());

        const filteredMatches = matchesData.filter(match =>
          dayFilter === "sve" ? true : match.day === dayFilter

          
        );

        const updatedPlayers = calculateStats(playersData, filteredMatches);
        setPlayers(updatedPlayers);
      } catch (error) {
        console.error("❌ Greška pri dohvaćanju podataka:", error);
      }
    };

    applyFilter();
  }, [dayFilter]);

  const getTopMVPs = (playersList) => {
    return [...playersList]
      .map(player => {
        const goals = Number(player.goals) || 0;
        const assists = Number(player.assists) || 0;
        const wins = Number(player.wins) || 0;
        const goalDiff = Number(player.goalDifference) || 0;
  
        const mvpPoints = goals + assists * 0.5 + wins * 3 + goalDiff * 0.5;
  
        return {
          ...player,
          mvpPoints: mvpPoints.toFixed(1)
        };
      })
      .sort((a, b) => b.mvpPoints - a.mvpPoints)
      
  };
  

  const calculateStats = (playersList, matchesList) => {
    return playersList.map(player => {
      let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
      let matchesPlayed = 0, goals = 0, assists = 0;      

      matchesList.forEach(match => {
        const isInTeamA = match.teamA?.includes(player.name);
        const isInTeamB = match.teamB?.includes(player.name);
        const stats = match.stats?.[player.name];
        if (stats) {
          goals += stats.goals || 0;
          assists += stats.assists || 0;
        }        

        if (isInTeamA || isInTeamB) {
          matchesPlayed++;
          const isTeamA = isInTeamA;
          const teamGoals = isTeamA ? match.scoreA : match.scoreB;
          const opponentGoals = isTeamA ? match.scoreB : match.scoreA;

          goalsFor += teamGoals;
          goalsAgainst += opponentGoals;

          if (teamGoals > opponentGoals) wins++;
          else if (teamGoals < opponentGoals) losses++;
          else draws++;
        }
      });

      const successRate = matchesPlayed > 0 ? ((wins / matchesPlayed) * 100).toFixed(1) + "%" : "0%";
      const points = wins * 3 + draws * 2 + losses;
      const successPoints = ((parseFloat(successRate) / 100) * points).toFixed(1);

      return {
        ...player,
        wins,
        draws,
        losses,
        matchesPlayed,
        goals,
        assists,
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
    let bestMvp = null;
    let maxMvpPoints = -1;
    playersList.forEach(player => {
      const mvpPoints = (player.goals || 0) * 1 + (player.assists || 0) * 0.5 + (player.wins || 0) * 3 + (player.goalDifference || 0) * 0.5;
      if (mvpPoints > maxMvpPoints) {
        maxMvpPoints = mvpPoints;
        bestMvp = player;
      }
    });
    setMvp(bestMvp);
  };

  

  return (
    <div className="leaderboard-container">
      <h2>🏆 Rang Lista Igrača</h2>

      <div className="sort-buttons">
        <button onClick={() => setSortType('points')}>Sortiraj po Bodovima</button>
        <button onClick={() => setSortType('successPoints')}>Sortiraj po Uspješnost x Bodovi</button>
        <button onClick={() => setSortType('successRate')}>Sortiraj po Uspješnosti</button>
        <button onClick={() => setSortType('goalDifference')}>Sortiraj po Gol Razlici</button>
      </div>

      <div className="sort-buttons">
        <button onClick={() => setDayFilter('sve')}>Sve</button>
        <button onClick={() => setDayFilter('utorak')}>Utorak</button>
        <button onClick={() => setDayFilter('petak')}>Petak</button>
      </div>

      {mvp && (
        <div className="mvp-box">
          <h3>MVP Sezone: {mvp.name} - {(
            (mvp.goals || 0) * 1 + 
            (mvp.assists || 0) * 0.5 + 
            (mvp.wins || 0) * 3 + 
            (mvp.goalDifference || 0) * 0.5
          ).toFixed(1)} POINTS 🥇</h3>
        </div>
      )}


      <div style={{ overflowX: "auto" }}>
      <div className="scroll-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th><th>Igrač</th><th>Golovi</th><th>Asistencije</th><th>Uspješnost x Bodovi</th><th>Uspješnost</th><th>Bodovi</th><th>Gol Razlika</th><th>Post. Golovi</th><th>Prim. Golovi</th><th>W</th><th>D</th><th>L</th><th>P</th>
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
              <tr><td colSpan="15">Nema dostupnih podataka</td></tr>
            )}
          </tbody>
        </table>
        </div>


        {sortedPlayers.length > 0 && (
  <div className="mvp-table">
    <h3>🏅 Top MVP Igrači</h3>
    <table className="leaderboard-table" style={{ maxWidth: "600px" }}>
      <thead>
        <tr>
          <th>#</th><th>Igrač</th><th>MVP Bodovi</th>
        </tr>
      </thead>
      <tbody>
        {getTopMVPs(sortedPlayers).map((player, index) => (
          <tr key={player.id}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.mvpPoints}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
      </div>
    </div>
  );
};

export default Leaderboard;