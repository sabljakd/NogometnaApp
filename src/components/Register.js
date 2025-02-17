import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { auth, db, createUserWithEmailAndPassword } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import '../App.css';

const Register = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const history = useHistory();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setEmailSent(true);

      // Dodavanje igrača u Firestore bazu
      await setDoc(doc(db, "players", user.email), {
        name,
        email,
        goals: 0,
        assists: 0,
        matchesPlayed: 0
      });

      setUser(user);
      history.push("/profile"); // Preusmjeravanje na profil nakon registracije
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2>Registracija</h2>
      {error && <p className="error-message">{error}</p>}

      {!emailSent ? (
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Ime i prezime" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Lozinka" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Registriraj se</button>
        </form>
      ) : (
        <p>Poslali smo vam verifikacijski email. Provjerite svoj inbox!</p>
      )}
    </div>
  );
};

export default Register;
