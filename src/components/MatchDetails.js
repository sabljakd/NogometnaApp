import React, { useState, useEffect } from 'react';
import { db, collection, doc, getDoc, getDocs, updateDoc } from '../firebase';
import { useParams, useHistory } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';

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

          // Ako postoje podaci o timovima, učitaj ih
          setTeamA(matchData.teamA || []);
          setTeamB(matchData.teamB || []);
          setScoreA(matchData.scoreA || 0);
          setScoreB(matchData.scoreB || 0);
          setStats(matchData.stats || {});

          // Formatiranje podataka za graf
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
      setTeamA([...teamA, player.name]); // Dodaj novog igrača u Tim A
    } else if (team === 'B' && !teamB.includes(player.name)) {
      setTeamB([...teamB, player.name]); // Dodaj novog igrača u Tim B
    }
};


const handleSaveMatch = async () => {
    try {
        const matchRef = doc(db, "matches", id);
        await updateDoc(matchRef, {
            teamA: teamA, // Sprema sve igrače u Tim A
            teamB: teamB, // Sprema sve igrače u Tim B
            scoreA: parseInt(scoreA),
            scoreB: parseInt(scoreB),
            stats
        });

      for (const playerName in stats) {
        const playerQuery = collection(db, "players");
        const playerSnapshot = await getDocs(playerQuery);
        const playerDoc = playerSnapshot.docs.find(doc => doc.data().name === playerName);

        if (playerDoc) {
          const playerRef = doc(db, "players", playerDoc.id);
          const playerData = playerDoc.data();

          await updateDoc(playerRef, {
            goals: (playerData.goals || 0) + (stats[playerName].goals || 0),
            assists: (playerData.assists || 0) + (stats[playerName].assists || 0),
            matchesPlayed: (playerData.matchesPlayed || 0) + 1
          });
        }
      }

      alert("Utakmica i statistika igrača su ažurirani!");
    } catch (error) {
      console.error("Greška pri spremanju utakmice:", error);
    }
};

  return (
    <div className="container">
      {match ? (
        <>
          <h2><span role="img" aria-label="chart">📈</span> Uređivanje Utakmice</h2>
          <p><strong>Datum:</strong> {match.date}</p>
          <p><strong>Vrijeme:</strong> {match.time}</p>
          <p><strong>Lokacija:</strong> {match.location}</p>

          {user && user.isAdmin && (
            <>
              <h3>Dodaj igrače u timove</h3>
<label>Tim A:</label>
<select onChange={(e) => handleAddToTeam('A', e.target.value)}>
    <option value="">Odaberi igrača</option>
    {players.map(player => (
        <option key={player.id} value={player.id}>{player.name}</option>
    ))}
</select>

<label>Tim B:</label>
<select onChange={(e) => handleAddToTeam('B', e.target.value)}>
    <option value="">Odaberi igrača</option>
    {players.map(player => (
        <option key={player.id} value={player.id}>{player.name}</option>
    ))}
</select>

<h3>Tim A</h3>
<ul>
    {teamA.map((player, index) => (
        <li key={index}>{player}</li>
    ))}
</ul>

<h3>Tim B</h3>
<ul>
    {teamB.map((player, index) => (
        <li key={index}>{player}</li>
    ))}
</ul>

              <h3><span role="img" aria-label="score">⚽</span> Rezultat: {scoreA} - {scoreB}</h3>
              <input type="number" value={scoreA} onChange={(e) => setScoreA(parseInt(e.target.value))} />
              <span> : </span>
              <input type="number" value={scoreB} onChange={(e) => setScoreB(parseInt(e.target.value))} />

              <h3>Statistika igrača</h3>
              {players.map(player => (
                <div key={player.id}>
                  <p>{player.name}</p>
                  <label>Golovi:</label>
                  <input
                    type="number"
                    value={stats[player.name]?.goals || 0}
                    onChange={(e) => setStats({
                      ...stats,
                      [player.name]: {
                        ...stats[player.name],
                        goals: parseInt(e.target.value)
                      }
                    })}
                  />
                  <label>Asistencije:</label>
                  <input
                    type="number"
                    value={stats[player.name]?.assists || 0}
                    onChange={(e) => setStats({
                      ...stats,
                      [player.name]: {
                        ...stats[player.name],
                        assists: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
              ))}

              <button onClick={handleSaveMatch}>Spremi utakmicu</button>
            </>
          )}

          <h3><span role="img" aria-label="graph">📊</span> Statistika Utakmice</h3>
          {statsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="goals" fill="#007bff" name="Golovi" />
                <Bar dataKey="assists" fill="#28a745" name="Asistencije" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>Nema dostupnih podataka za prikaz statistike.</p>
          )}
        </>
      ) : (
        <p>Učitavanje podataka o utakmici...</p>
      )}
    </div>
  );
};

export default MatchDetails;
