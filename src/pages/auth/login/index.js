import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import classes from '../../../styles/login.module.css';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const router = useRouter();

  const setUserCookie = (user) => {
    Cookies.set('user_id', user);
  }

  const login = async () => {
    setError(null);
    try {
      const resp = await axios.post('/user/login', { email, password });
      setUserCookie(resp.data.id);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <h1>Login</h1>
        <div className={classes.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={classes.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className={classes.btn} onClick={login}>Login</button>
        {error && <p className={classes.error}>{error}</p>}
        <p className={classes.registerLink}>
          Don't have an account? <Link href="/auth/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
