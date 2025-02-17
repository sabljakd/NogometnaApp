import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, deleteDoc, doc } from '../firebase';
import '../App.css';

const AdminStats = ({ user }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        const playersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlayers(playersData);
      } catch (error) {
        console.error("Greška pri dohvaćanju igrača:", error);
      }
    };

    fetchPlayers();
  }, []);

  const deletePlayer = async (playerId) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovog igrača?")) return;

    try {
      await deleteDoc(doc(db, "players", playerId));
      setPlayers(players.filter(player => player.id !== playerId)); // Ažuriraj UI nakon brisanja
      alert("Igrač uspješno obrisan!");
    } catch (error) {
      console.error("Greška pri brisanju igrača:", error);
    }
  };

  if (!user || !user.isAdmin) {
    return <p>⚠ Nemate ovlasti za pristup ovoj stranici.</p>;
  }

  return (
    <div className="container">
      <h2>Admin Panel - Upravljanje Igračima</h2>
      {players.length > 0 ? (
        <ul className="player-list">
          {players.map(player => (
            <li key={player.id} className="player-item">
              <span>{player.id} - {player.name || "Nepoznato ime"}</span>
              <button className="delete-button" onClick={() => deletePlayer(player.id)}>🗑 Obriši</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nema igrača u bazi.</p>
      )}
    </div>
  );
};

export default AdminStats;
