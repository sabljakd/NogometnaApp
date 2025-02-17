import React, { useState, useEffect } from 'react';
import AdminPanel from './AdminPanel';
import { db, collection, addDoc, onSnapshot, deleteDoc, doc } from '../firebase';
import { Link } from 'react-router-dom';

/* eslint-disable jsx-a11y/accessible-emoji */

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
    if (!window.confirm("Jeste li sigurni da želite obrisati ovu utakmicu?")) return;
    
    try {
      await deleteDoc(doc(db, "matches", id));
      alert("Termin obrisan!");
    } catch (error) {
      console.error("Greška pri brisanju termina:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>⚽ Raspored Utakmica</h2>

      {/* Samo admin može dodavati termine */}
      {user && user.isAdmin && <AdminPanel user={user} addMatch={addMatch} />}

      <div style={styles.matchList}>
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} style={styles.matchCard}>
              <div style={styles.matchInfo}>
                <h3 style={styles.matchTitle}>📅 {match.date} - ⏰ {match.time}</h3>
                <p><strong>📍 Lokacija:</strong> {match.location}</p>
                <p><strong>👥 Igrači:</strong> {match.players?.join(", ") || "Nema prijavljenih"}</p>
              </div>

              <div style={styles.buttonGroup}>
                {user && user.isAdmin && (
                  <button onClick={() => deleteMatch(match.id)} style={styles.deleteButton}>
                    🗑️ Obriši
                  </button>
                )}
                {user && user.isAdmin && (
                  <Link to={`/match/${match.id}`} style={styles.editLink}>
                    ✏️ Uredi utakmicu
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={styles.noMatches}>📭 Nema dostupnih utakmica.</p>
        )}
      </div>
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
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: "20px",
  },
  matchList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  matchCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "0.3s ease-in-out",
  },
  matchCardHover: {
    background: "#e9ecef",
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    margin: "0 0 10px 0",
    fontSize: "18px",
    color: "#333",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  deleteButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: "5px",
    fontWeight: "bold",
    transition: "0.3s ease-in-out",
  },
  deleteButtonHover: {
    background: "#c82333",
  },
  editLink: {
    background: "#007bff",
    color: "white",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    fontWeight: "bold",
    transition: "0.3s ease-in-out",
  },
  editLinkHover: {
    background: "#0056b3",
  },
  noMatches: {
    textAlign: "center",
    fontSize: "16px",
    color: "#666",
    marginTop: "20px",
  },
};

/* eslint-enable jsx-a11y/accessible-emoji */

export default Schedule;
