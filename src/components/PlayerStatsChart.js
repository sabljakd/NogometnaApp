import React, { useEffect, useState } from 'react';
import { db, doc, getDoc } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import '../App.css';

const PlayerStatsChart = ({ user }) => {
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchPlayerStats = async () => {
      try {
        const playerRef = doc(db, "players", user.email);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
          setPlayerStats(playerSnap.data());
        } else {
          console.log("Nema podataka za ovog igrača.");
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju statistike:", error);
      }
    };

    fetchPlayerStats();
  }, [user]);

  if (!playerStats) {
    return <p>Učitavanje podataka...</p>;
  }

  const data = [
    { name: "Golovi", value: playerStats.goals || 0 },
    { name: "Asistencije", value: playerStats.assists || 0 },
    { name: "Utakmice", value: playerStats.matchesPlayed || 0 },
  ];

  return (
    <div className="container">
      <h2>Statistika Igrača</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerStatsChart;
