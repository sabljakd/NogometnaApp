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

  const generateTeams = () => {
    let teamAList = [];
    let teamBList = [];
    
    // Sort only the selected players by their ranking
    let sortedSelectedPlayers = [...selectedPlayers].sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Apply the correct pattern for team division
    sortedSelectedPlayers.forEach((player, index) => {
      const modIndex = index % 10;
      if ([0, 3, 4, 7, 8].includes(modIndex)) {
        teamAList.push(player);
      } else {
        teamBList.push(player);
      }
    });
    
    setTeamA(teamAList);
    setTeamB(teamBList);
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