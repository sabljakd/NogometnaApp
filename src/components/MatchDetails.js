import React, { useState, useEffect } from 'react';
import { db, collection, doc, getDoc, getDocs, updateDoc } from '../firebase';
import { useParams, useHistory } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/* eslint-disable jsx-a11y/accessible-emoji */

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

    if (team === 'A' && !teamA.includes(player.name)) {
      setTeamA([...teamA, player.name]);
    } else if (team === 'B' && !teamB.includes(player.name)) {
      setTeamB([...teamB, player.name]);
    }
  };

  const handleSaveMatch = async () => {
    try {
        const matchRef = doc(db, "matches", id);
        await updateDoc(matchRef, {
            teamA: teamA,
            teamB: teamB,
            scoreA: parseInt(scoreA),
            scoreB: parseInt(scoreB),
            stats
        });

        const playerSnapshot = await getDocs(collection(db, "players"));

        for (const playerDoc of playerSnapshot.docs) {
            const playerRef = doc(db, "players", playerDoc.id);
            const playerData = playerDoc.data();

            const playerName = playerData.name;

            // Provjeri je li igrač sudjelovao u utakmici
            const isInTeamA = teamA.includes(playerName);
            const isInTeamB = teamB.includes(playerName);

            if (isInTeamA || isInTeamB) {
                const goals = stats[playerName]?.goals || 0;
                const assists = stats[playerName]?.assists || 0;
                const currentMatchesPlayed = playerData.matchesPlayed || 0;

                await updateDoc(playerRef, {
                    matchesPlayed: currentMatchesPlayed + 1, // ✅ Dodaj odigranu utakmicu, čak i ako je 0 golova/asistencija
                    goals: (playerData.goals || 0) + goals,
                    assists: (playerData.assists || 0) + assists
                });

                console.log(`✅ Ažurirano: ${playerName} - +1 utakmica`);
            }
        }

        alert("Utakmica i statistika igrača su ažurirani!");
    } catch (error) {
        console.error("❌ Greška pri spremanju utakmice:", error);
    }
};


  return (
    <div style={styles.container}>
      {match ? (
        <>
          <h2 style={styles.heading}>📈 Uređivanje Utakmice</h2>
          <p><strong>📅 Datum:</strong> {match.date}</p>
          <p><strong>⏰ Vrijeme:</strong> {match.time}</p>
          <p><strong>📍 Lokacija:</strong> {match.location}</p>

          {user && user.isAdmin && (
            <>
              <h3>Dodaj igrače u timove</h3>
              <div style={styles.formRow}>
                <label>Tim A:</label>
                <select onChange={(e) => handleAddToTeam('A', e.target.value)} style={styles.select}>
                  <option value="">Odaberi igrača</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>

                <label>Tim B:</label>
                <select onChange={(e) => handleAddToTeam('B', e.target.value)} style={styles.select}>
                  <option value="">Odaberi igrača</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
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
              {[...teamA, ...teamB]
  .sort((a, b) => a.localeCompare(b))
  .map((playerName) => (
    <div key={playerName} style={styles.statContainer}>
      <p>{playerName}</p>
      <label>Golovi:</label>
      <input
        type="number"
        value={stats[playerName]?.goals || 0}
        onChange={(e) =>
          setStats({
            ...stats,
            [playerName]: {
              ...stats[playerName],
              goals: parseInt(e.target.value),
            },
          })
        }
        style={styles.input}
      />
      <label>Asistencije:</label>
      <input
        type="number"
        value={stats[playerName]?.assists || 0}
        onChange={(e) =>
          setStats({
            ...stats,
            [playerName]: {
              ...stats[playerName],
              assists: parseInt(e.target.value),
            },
          })
        }
        style={styles.input}
      />
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
  heading: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: "15px",
  },
  formRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "15px",
  },
  select: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "180px",
    textAlign: "center",
  },
  teamList: {
    listStyle: "none",
    padding: "0",
    margin: "10px 0",
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "10px",
    minHeight: "40px",
  },
  scoreContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  scoreDivider: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    width: "80px",
    fontSize: "16px",
    textAlign: "center",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "0.3s",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
};


/* eslint-enable jsx-a11y/accessible-emoji */

export default MatchDetails;
