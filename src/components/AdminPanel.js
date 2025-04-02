import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, doc } from '../firebase';
import '../App.css';

/* eslint-disable jsx-a11y/accessible-emoji */

const AdminPanel = ({ user }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        const playersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersList);
      } catch (error) {
        console.error("Greška pri dohvaćanju igrača:", error);
      }
    };

    fetchPlayers();
  }, []);

  if (!user || !user.isAdmin) {
    return <p>Nemate ovlasti za pristup ovoj stranici.</p>;
  }

  const updateStats = async () => {
    if (!selectedPlayer) return;

    try {
      const playerRef = doc(db, "players", selectedPlayer);
      await updateDoc(playerRef, { goals, assists, matchesPlayed });
      alert("Statistika igrača ažurirana!");
    } catch (error) {
      console.error("Greška pri ažuriranju statistike:", error);
    }
  };

  const addMatch = async (e) => {
    e.preventDefault();
    if (!date || !time || !location) {
      alert("Sva polja su obavezna!");
      return;
    }

    try {
      
    const dayOfWeek = new Date(date).toLocaleDateString('hr-HR', {
      weekday: 'long'
    }).toLowerCase();

    await addDoc(collection(db, "matches"), {
      date,
      time,
      location,
      day: dayOfWeek,
      players: []
    });
    
      alert("Utakmica dodana!");
      setDate('');
      setTime('');
      setLocation('');
    } catch (error) {
      console.error("Greška pri dodavanju utakmice:", error);
    }
  };

  const resetAllStats = async () => {
    if (!window.confirm("Jeste li sigurni da želite resetirati sve statistike igrača na nulu?")) return;

    try {
      for (const player of players) {
        const playerRef = doc(db, "players", player.id);
        await updateDoc(playerRef, {
          goals: 0,
          assists: 0,
          matchesPlayed: 0
        });
      }
      alert("Sve statistike igrača su resetirane!");
      window.location.reload();
    } catch (error) {
      console.error("Greška pri resetiranju statistika igrača:", error);
    }
  };

  
  const rebuildPlayerDailyStats = async () => {
    try {
      const matchesSnapshot = await getDocs(collection(db, "matches"));
      const playersSnapshot = await getDocs(collection(db, "players"));

      const statsMap = {};

      matchesSnapshot.forEach((matchDoc) => {
        const matchData = matchDoc.data();
        const playerStats = matchData.stats || {};
        const teamA = matchData.teamA || [];
        const teamB = matchData.teamB || [];
        const allPlayers = [...new Set([...teamA, ...teamB])];

        const dayName = new Date(matchData.date).toLocaleDateString('hr-HR', {
          weekday: 'long'
        }).toLowerCase();

        allPlayers.forEach((playerName) => {
          if (!statsMap[playerName]) {
            statsMap[playerName] = {};
          }

          if (!statsMap[playerName][dayName]) {
            statsMap[playerName][dayName] = { goals: 0, assists: 0, matchesPlayed: 0 };
          }

          const goals = Number(playerStats[playerName]?.goals) || 0;
          const assists = Number(playerStats[playerName]?.assists) || 0;          

          statsMap[playerName][dayName].goals += goals;
          statsMap[playerName][dayName].assists += assists;
          
          statsMap[playerName][dayName].matchesPlayed += 1;
        });
      });

      for (const playerDoc of playersSnapshot.docs) {
        const playerRef = doc(db, "players", playerDoc.id);
        const name = playerDoc.data().name;

        const dailyStats = statsMap[name] || {};

        // ✅ Zbrajanje ukupnih vrijednosti
        let totalGoals = 0;
        let totalAssists = 0;
        let totalMatches = 0;

        Object.values(dailyStats).forEach(day => {
          totalGoals += day.goals || 0;
          totalAssists += day.assists || 0;
          totalMatches += day.matchesPlayed || 0;
        });

        await updateDoc(playerRef, {
          stats: dailyStats,
          goals: totalGoals,
          assists: totalAssists,
          matchesPlayed: totalMatches
        });

        console.log(`📅 Statistika po danima + ukupno ažurirana za ${name}`);
      }

      alert("📊 Statistika po danima uspješno ažurirana!");
    } catch (error) {
      console.error("❌ Greška pri ažuriranju dnevne statistike:", error);
    }
  };

  const rebuildMatchDays = async () => {
    try {
      const matchesSnapshot = await getDocs(collection(db, "matches"));
  
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        const matchRef = doc(db, "matches", matchDoc.id);
  
        if (matchData.date) {
          const day = new Date(matchData.date).toLocaleDateString("hr-HR", {
            weekday: "long",
          }).toLowerCase();
  
          await updateDoc(matchRef, {
            day: day
          });
  
          console.log(`✅ Match ${matchDoc.id} - day: ${day}`);
        }
      }
  
      alert("📅 Dan u tjednu (day) uspješno dodan svim utakmicama!");
    } catch (error) {
      console.error("❌ Greška prilikom dodavanja day polja u matches:", error);
    }
  };
  

  return (
    <div className="admin-container">
      <h2>⚙ Admin Panel</h2>

      {/* Sekcija za dodavanje utakmica */}
      <div className="admin-section">
        <h3>➕ Dodaj novu utakmicu</h3>
        <form onSubmit={addMatch} className="form-grid">
          <div>
            <label>📅 Datum:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label>⏰ Vrijeme:</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div>
            <label>📍 Lokacija:</label>
            <input type="text" placeholder="Lokacija" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <button type="submit" className="add-match-btn">Dodaj utakmicu</button>
        </form>
      </div>

      {/* Sekcija za ažuriranje statistike igrača */}
      <div className="admin-section">
        <h3>🛠 Uređivanje statistike igrača</h3>
        <div className="form-grid">
          <div>
            <label>🎯 Odaberi igrača:</label>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
              <option value="">-- Odaberi igrača --</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>{player.name} - {player.goals} golova</option>
              ))}
            </select>
          </div>
          <div>
            <label>⚽ Golovi:</label>
            <input type="number" value={goals} onChange={(e) => setGoals(parseInt(e.target.value))} />
          </div>
          <div>
            <label>🎯 Asistencije:</label>
            <input type="number" value={assists} onChange={(e) => setAssists(parseInt(e.target.value))} />
          </div>
          <div>
            <label>🏆 Odigrane utakmice:</label>
            <input type="number" value={matchesPlayed} onChange={(e) => setMatchesPlayed(parseInt(e.target.value))} />
          </div>
          <button onClick={updateStats} className="update-stats-btn">Spremi promjene</button>
        </div>
        <button className="reset-button" onClick={resetAllStats}>🗑 Resetiraj sve statistike</button>
        <button className="rebuild-button" onClick={rebuildPlayerDailyStats}>
          ♻️ Rebuild statistike po danima
        </button>
        <button onClick={rebuildMatchDays}>
  🔁 Dodaj dan (day) svim utakmicama
</button>

      </div>

      {/* Pregled svih igrača */}
      <div className="admin-section">
        <h3>📋 Pregled registriranih igrača</h3>
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id} className="player-item">
              <strong>{player.name}</strong> - {player.email} | ⚽ {player.goals} | 🎯 {player.assists} | 🏆 {player.matchesPlayed}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/* eslint-enable jsx-a11y/accessible-emoji */

export default AdminPanel;
