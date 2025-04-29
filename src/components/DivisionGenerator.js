import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../firebase';

const DivisionGenerator = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        let playersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort players by ranking (default sorting by points, descending)
        playersList.sort((a, b) => (b.points || 0) - (a.points || 0));
        setPlayers(playersList);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  const handleSelectPlayer = (player) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
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
      const goalDifference = goalsFor - goalsAgainst;
      const mvpPoints = (goals) + (assists * 0.5) + (wins * 3) + (goalDifference * 0.5);

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
        mvpPoints: mvpPoints.toFixed(1),
      };
      
    });
  };

  const generateTeams = async () => {
    try {
      const matchesSnapshot = await getDocs(collection(db, "matches"));
      const matchesData = matchesSnapshot.docs.map(doc => doc.data());

      const updatedSelected = calculateStats(selectedPlayers, matchesData);
      const sortedSelected = updatedSelected.sort((a, b) => (b.mvpPoints || 0) - (a.mvpPoints || 0));

      let teamAList = [];
      let teamBList = [];
      const pattern = "abbaabbaabbaabba";

      sortedSelected.forEach((player, index) => {
        if (pattern[index % pattern.length] === 'a') {
          teamAList.push(player);
        } else {
          teamBList.push(player);
        }
      });

      setTeamA(teamAList);
      setTeamB(teamBList);
    } catch (error) {
      console.error("❌ Greška pri generiranju timova:", error);
    }
  };

  return (
    <div style={styles.divisionGenerator}>
      <h2>📋 Select Players for Team Division</h2>
      <div style={styles.playerList}>
        {players.map(player => (
          <div 
            key={player.id} 
            style={{
              ...styles.playerCard,
              backgroundColor: selectedPlayers.includes(player) ? '#007bff' : 'white',
              color: selectedPlayers.includes(player) ? 'white' : 'black'
            }}
            onClick={() => handleSelectPlayer(player)}
          >
            {player.name}
          </div>
        ))}
      </div>
      <button onClick={generateTeams} style={styles.generateBtn}>Generate Teams</button>

      {teamA.length > 0 && teamB.length > 0 && (
        <div style={styles.teamsContainer}>
          <div style={styles.team}>
            <h3>🏆 Team A</h3>
            <ul>
              {teamA.map(player => <li key={player.id}>{player.name}</li>)}
            </ul>
          </div>
          <div style={styles.team}>
            <h3>⚽ Team B</h3>
            <ul>
              {teamB.map(player => <li key={player.id}>{player.name}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  divisionGenerator: {
    textAlign: 'center',
    marginTop: '20px',
  },
  playerList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
  },
  playerCard: {
    padding: '10px 15px',
    border: '2px solid #007bff',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: '0.3s',
  },
  generateBtn: {
    marginTop: '15px',
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '5px',
  },
  teamsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '20px',
  },
  team: {
    border: '2px solid #007bff',
    padding: '15px',
    borderRadius: '8px',
    background: '#f8f9fa',
  }
};

export default DivisionGenerator;
