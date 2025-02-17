import React, { useState, useEffect } from 'react';
import AdminPanel from './AdminPanel';
import { db, collection, addDoc, onSnapshot, deleteDoc, doc,  } from '../firebase';
import { Link } from 'react-router-dom';
import '../App.css';

const Schedule = ({ user }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "matches"), (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const addMatch = async (match) => {
    try {
      await addDoc(collection(db, "matches"), { ...match, players: [] });
      alert("Termin uspješno dodan!");
    } catch (error) {
      console.error("Greška pri dodavanju termina:", error);
    }
  };
  

  const deleteMatch = async (id) => {
    try {
      await deleteDoc(doc(db, "matches", id));
      alert("Termin obrisan!");
    } catch (error) {
      console.error("Greška pri brisanju termina:", error);
    }
  };

  return (
    <div className="container">
      <h2>Raspored Utakmica</h2>

      {/* Samo admin može dodavati termine */}
      {user && user.isAdmin && <AdminPanel user={user} addMatch={addMatch} />}

      <ul>
        {matches.map((match) => (
          <li key={match.id} className="match-card">
            <span>{match.date} - {match.time} - {match.location}</span>
            <p>Igrači: {match.players?.join(", ") || "Nema prijavljenih"}</p>

            {/* Dugme za brisanje termina (samo admini) */}
            {user && user.isAdmin && (
              <button onClick={() => deleteMatch(match.id)}>Obriši</button>
            )}
            {user && user.isAdmin && (
              <Link to={`/match/${match.id}`} className="match-link">Uredi utakmicu</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Schedule;
