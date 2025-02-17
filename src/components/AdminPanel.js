import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, doc } from '../firebase';
import '../App.css';

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

        console.log("Dohvaćeni igrači:", playersList); // Debugging
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
      await updateDoc(playerRef, { 
        goals,
        assists,
        matchesPlayed
      });
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
      await addDoc(collection(db, "matches"), { date, time, location, players: [] });
      alert("Utakmica dodana!");
      setDate('');
      setTime('');
      setLocation('');
    } catch (error) {
      console.error("Greška pri dodavanju utakmice:", error);
    }
  };

  return (
    <div className="container">
      <h2>Admin Panel</h2>

      {/* Sekcija za dodavanje utakmica */}
      <div className="admin-section">
        <h3>Dodaj novu utakmicu</h3>
        <form onSubmit={addMatch}>
          <label>Datum:</label>
          <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
          <label>Vrijeme:</label>
          <input type="time" className="input-field" value={time} onChange={(e) => setTime(e.target.value)} required />
          <label>Lokacija:</label>
          <input type="text" className="input-field" placeholder="Lokacija" value={location} onChange={(e) => setLocation(e.target.value)} required />
          <button type="submit">Dodaj utakmicu</button>
        </form>
      </div>

      {/* Sekcija za ažuriranje statistike igrača */}
      <div className="admin-section">
        <h3>Uređivanje statistike igrača</h3>
        <label>Odaberi igrača:</label>
        <select className="input-field" value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
          <option value="">-- Odaberi igrača --</option>
          {players.length > 0 ? (
            players.map(player => (
              <option key={player.id} value={player.id}>{player.name} - {player.goals} golova</option>
            ))
          ) : (
            <option value="">Nema dostupnih igrača</option>
          )}
        </select>

        <label>Golovi:</label>
        <input type="number" className="input-field" value={goals} onChange={(e) => setGoals(parseInt(e.target.value))} />
        <label>Asistencije:</label>
        <input type="number" className="input-field" value={assists} onChange={(e) => setAssists(parseInt(e.target.value))} />
        <label>Odigrane utakmice:</label>
        <input type="number" className="input-field" value={matchesPlayed} onChange={(e) => setMatchesPlayed(parseInt(e.target.value))} />
        <button onClick={updateStats}>Spremi promjene</button>
      </div>

      {/* Pregled svih igrača */}
      <div className="admin-section">
        <h3>Pregled registriranih igrača</h3>
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id} className="player-item">
              <strong>{player.name}</strong> - {player.email} | Golovi: {player.goals} | Asistencije: {player.assists} | Utakmice: {player.matchesPlayed}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
