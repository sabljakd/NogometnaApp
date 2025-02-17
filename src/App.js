import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, Link, useHistory } from 'react-router-dom';
import { auth, db, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Register from './components/Register';
import Schedule from './components/Schedule';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import AdminStats from './components/AdminStats';
import MatchDetails from './components/MatchDetails';
import Home from "./components/Home";
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        if (authUser.emailVerified) {
          try {
            const userRef = doc(db, "users", authUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                isAdmin: userSnap.data().isAdmin || false
              });
            } else {
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                isAdmin: false
              });
            }
          } catch (error) {
            console.error("❌ Greška pri dohvaćanju korisnika iz Firestore:", error);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      history.push('/login');
    } catch (error) {
      console.error("❌ Greška pri odjavi:", error);
    }
  };

  if (loading) {
    return <p>Učitavanje...</p>;
  }

  return (
    <Router>
      <div>
        {user ? (
          <>
            <nav className="navbar">
              <h1>Nogometni Termini</h1>
              <div>
                <Link to="/">Početna</Link>
                {user.isAdmin && <Link to="/schedule">Raspored</Link>}
                <Link to="/profile">Profil</Link>
                <Link to="/leaderboard">Rang Lista</Link>
                {user.isAdmin && <Link to="/admin-stats">Admin Panel</Link>}
                <button onClick={handleLogout}>Odjava</button>
              </div>
            </nav>

            <div className="container">
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/schedule" component={() => user.isAdmin ? <Schedule user={user} /> : <Redirect to="/" />} />
                <Route path="/profile" component={() => <Profile user={user} />} />
                <Route path="/profile/:email" component={Profile} /> {/* 📌 Koristi email kao parametar */}
                <Route path="/match/:id" component={() => <MatchDetails user={user} />} />
                <Route path="/leaderboard" component={Leaderboard} />
                {user.isAdmin && <Route path="/admin-stats" component={() => <AdminStats user={user} />} />}
                <Redirect to="/" />
              </Switch>
            </div>
          </>
        ) : (
          <div className="auth-container">
            <Switch>
              <Route path="/login" component={() => <Login setUser={setUser} />} />
              <Route path="/register" component={() => <Register setUser={setUser} />} />
              <Redirect to="/login" />
            </Switch>
            <p>
              Nemate račun? <Link to="/register">Registrirajte se ovdje</Link>.
            </p>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
