import React, { useState, useEffect } from 'react';
import { db, doc, getDoc } from '../firebase';
import { useParams } from 'react-router-dom';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';

const Profile = ({ user }) => {
  const { email } = useParams(); // ✅ Dohvaćamo email iz URL-a
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const playerRef = doc(db, "players", email || user?.email); // ✅ Ako nema emaila u URL-u, uzmi user.email
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
          setPlayerStats(playerSnap.data());
        } else {
          console.warn("⚠ Igrač nije pronađen u Firestore-u!");
        }
      } catch (error) {
        console.error("❌ Greška pri dohvaćanju statistike:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [email, user]);

  if (loading) return <p> Učitavanje podataka...</p>;
  if (!playerStats) return <p>⚠ Nema podataka za ovog igrača.</p>;

  // Izračun prosjeka
  const totalMatches = playerStats.matchesPlayed || 1;
  const avgGoals = (playerStats.goals || 0) / totalMatches;
  const avgAssists = (playerStats.assists || 0) / totalMatches;

  // Podaci za grafikon
  const chartData = [
    { name: "Golovi", value: playerStats.goals || 0, fill: "#007bff" },
    { name: "Asistencije", value: playerStats.assists || 0, fill: "#28a745" },
    { name: "Utakmice", value: playerStats.matchesPlayed || 0, fill: "#ffc107" },
  ];

  return (
    <div className="profile-container">
      <h2>Profil Igrača</h2>
      <div className="profile-info">
        <p><strong>Ime:</strong> {playerStats.name}</p>
        <p><strong>Email:</strong> {playerStats.email}</p>
      </div>

      {/* Statistika */}
      <div className="stats-grid">
        <div className="stat-card">
          <span role="img" aria-label="goal">⚽</span>
          <h3>{playerStats.goals || 0}</h3>
          <p>Golovi</p>
        </div>
        <div className="stat-card">
          <span role="img" aria-label="assist">🎯</span>
          <h3>{playerStats.assists || 0}</h3>
          <p>Asistencije</p>
        </div>
        <div className="stat-card">
          <span role="img" aria-label="games">🏆</span>
          <h3>{playerStats.matchesPlayed || 0}</h3>
          <p>Odigrane Utakmice</p>
        </div>
      </div>

      {/* Prosjek */}
      <div className="stats-grid">
        <div className="stat-card">
          <span role="img" aria-label="average-goals">📊</span>
          <h3>{avgGoals.toFixed(2)}</h3>
          <p>Prosjek golova po utakmici</p>
        </div>
        <div className="stat-card">
          <span role="img" aria-label="average-assists">📊</span>
          <h3>{avgAssists.toFixed(2)}</h3>
          <p>Prosjek asistencija po utakmici</p>
        </div>
      </div>

      {/* Grafikon */}
      <div className="chart-container">
        <h3>Statistika</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={chartData}>
            <RadialBar minAngle={15} label={{ position: "insideStart", fill: "#fff" }} background dataKey="value" />
            <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Profile;
