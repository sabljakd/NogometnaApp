// ✅ MatchDetails.js (izmijenjeno spremanje statistike po danima)
import React, { useState, useEffect } from 'react';
import { db, collection, doc, getDoc, getDocs, updateDoc } from '../firebase';
import { useParams, useHistory } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MatchDetails = ({ user }) => {
  const { id } = useParams();
  const history = useHistory();
  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [stats, setStats] = useState({});
  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchRef = doc(db, "matches", id);
        const matchSnap = await getDoc(matchRef);
        if (matchSnap.exists()) {
          const matchData = matchSnap.data();
          setMatch({ id: matchSnap.id, ...matchData });
          setTeamA(matchData.teamA || []);
          setTeamB(matchData.teamB || []);
          setScoreA(matchData.scoreA || 0);
          setScoreB(matchData.scoreB || 0);
          setStats(matchData.stats || {});

          if (matchData.stats) {
            const formattedStats = Object.keys(matchData.stats).map(player => ({
              name: player,
              goals: matchData.stats[player].goals || 0,
              assists: matchData.stats[player].assists || 0,
            }));
            setStatsData(formattedStats);
          }
        } else {
          history.push("/schedule");
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju utakmice:", error);
      }
    };

    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        setPlayers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Greška pri dohvaćanju igrača:", error);
      }
    };

    fetchMatch();
    fetchPlayers();
  }, [id, history]);

  const handleAddToTeam = (team, playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    if (team === 'A' && !teamA.includes(player.name)) setTeamA([...teamA, player.name]);
    else if (team === 'B' && !teamB.includes(player.name)) setTeamB([...teamB, player.name]);
  };

  const handleSaveMatch = async () => {
    try {
      const matchRef = doc(db, "matches", id);
      await updateDoc(matchRef, {
        teamA,
        teamB,
        scoreA: parseInt(scoreA),
        scoreB: parseInt(scoreB),
        stats
      });

      const matchSnap = await getDoc(matchRef);
      const { dayType } = matchSnap.data();
      const playerSnapshot = await getDocs(collection(db, "players"));

      for (const playerDoc of playerSnapshot.docs) {
        const playerRef = doc(db, "players", playerDoc.id);
        const playerData = playerDoc.data();
        const playerName = playerData.name;

        const isInTeamA = teamA.includes(playerName);
        const isInTeamB = teamB.includes(playerName);

        if (isInTeamA || isInTeamB) {
          const goals = stats[playerName]?.goals || 0;
          const assists = stats[playerName]?.assists || 0;

          const prevStats = playerData.stats?.[dayType] || {
            goals: 0,
            assists: 0,
            matchesPlayed: 0
          };

          const updatedStats = {
            goals: prevStats.goals + goals,
            assists: prevStats.assists + assists,
            matchesPlayed: prevStats.matchesPlayed + 1
          };

          await updateDoc(playerRef, {
            [`stats.${dayType}`]: updatedStats
          });

          console.log(`✅ ${playerName} → ${dayType.toUpperCase()}: +1 utakmica, +${goals} golova, +${assists} asist.`);
        }
      }

      alert("Utakmica i statistika su ažurirani!");
    } catch (error) {
      console.error("❌ Greška pri spremanju:", error);
    }
  };

  const styles = {
    container: {
      maxWidth: "900px",
      margin: "30px auto",
      padding: "20px",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      textAlign: "center",
    },
    heading: { color: "#007bff", marginBottom: "15px" },
    formRow: { display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" },
    select: { padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "180px" },
    input: { padding: "10px", width: "80px", fontSize: "16px", textAlign: "center", borderRadius: "5px", border: "1px solid #ccc" },
    statContainer: { margin: "10px 0" },
    button: { backgroundColor: "#007bff", color: "white", padding: "12px 20px", fontSize: "16px", borderRadius: "8px", border: "none", cursor: "pointer" }
  };

  return (
    <div style={styles.container}>
      {match ? (
        <>
          <h2 style={styles.heading}>📈 Uređivanje Utakmice</h2>
          <p><strong>📅 Datum:</strong> {match.date}</p>
          <p><strong>⏰ Vrijeme:</strong> {match.time}</p>
          <p><strong>📍 Lokacija:</strong> {match.location}</p>
          <p><strong>📆 Dan:</strong> {match.dayType}</p>

          {user && user.isAdmin && (
            <>
              <div style={styles.formRow}>
                <label>Tim A:</label>
                <select onChange={(e) => handleAddToTeam('A', e.target.value)} style={styles.select}>
                  <option value="">Odaberi igrača</option>
                  {players.map(player => <option key={player.id} value={player.id}>{player.name}</option>)}
                </select>

                <label>Tim B:</label>
                <select onChange={(e) => handleAddToTeam('B', e.target.value)} style={styles.select}>
                  <option value="">Odaberi igrača</option>
                  {players.map(player => <option key={player.id} value={player.id}>{player.name}</option>)}
                </select>
              </div>

              <h3>Tim A</h3>
              <ul>{teamA.map((player, index) => <li key={index}>{player}</li>)}</ul>
              <h3>Tim B</h3>
              <ul>{teamB.map((player, index) => <li key={index}>{player}</li>)}</ul>

              <h3>⚽ Rezultat: {scoreA} - {scoreB}</h3>
              <div style={styles.formRow}>
                <input type="number" value={scoreA} onChange={(e) => setScoreA(parseInt(e.target.value))} style={styles.input} />
                <span> : </span>
                <input type="number" value={scoreB} onChange={(e) => setScoreB(parseInt(e.target.value))} style={styles.input} />
              </div>

              <h3>Statistika igrača</h3>
              {players.map(player => (
                <div key={player.id} style={styles.statContainer}>
                  <p>{player.name}</p>
                  <label>Golovi:</label>
                  <input type="number" value={stats[player.name]?.goals || 0}
                    onChange={(e) => setStats({ ...stats, [player.name]: { ...stats[player.name], goals: parseInt(e.target.value) } })}
                    style={styles.input} />
                  <label>Asistencije:</label>
                  <input type="number" value={stats[player.name]?.assists || 0}
                    onChange={(e) => setStats({ ...stats, [player.name]: { ...stats[player.name], assists: parseInt(e.target.value) } })}
                    style={styles.input} />
                </div>
              ))}

              <button onClick={handleSaveMatch} style={styles.button}>Spremi utakmicu</button>
            </>
          )}

          <h3>📊 Statistika Utakmice</h3>
          {statsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="goals" fill="#007bff" name="Golovi" />
                <Bar dataKey="assists" fill="#28a745" name="Asistencije" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p>Nema dostupnih podataka.</p>}
        </>
      ) : <p>Učitavanje podataka...</p>}
    </div>
  );
};

export default MatchDetails;