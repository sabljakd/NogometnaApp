import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { auth, db, signInWithEmailAndPassword, getDoc, doc } from '../firebase';
import '../App.css';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Prijava s Firebase autentifikacijom
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Provjera Firestore baze da vidimo je li admin
      const userRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userRef);
      const isAdmin = userSnap.exists() && userSnap.data().isAdmin === true;

      // Postavljanje korisnika s informacijom je li admin
      setUser({ ...user, isAdmin });
      
      // Ako je admin, preusmjeri na admin panel, inače na raspored
      history.push(isAdmin ? '/admin-stats' : '/'); 
      
    } catch (err) {
      setError("Neispravni podaci za prijavu.");
    }
  };

  return (
    <div className="container">
      <h2>Prijava</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Lozinka" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Prijavi se</button>
      </form>
    </div>
  );
};

export default Login;
