import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import classes from '../../../styles/register.module.css';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const setUserCookie = (user) => {
      Cookies.set('user_id', user);
    }

  const register = async () => {
    try {
      const resp = await axios.post('/user/users', {
          email,
          password,
          first_name: firstName,
          last_name: lastName
        })
      setUserCookie(resp.data.id);
      router.push('/');
    } catch (error) {
      console.error('Error registering:', error);
      alert(error.response?.data?.detail || 'Network error registering');
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <h1>Register</h1>
        <div className={classes.row}>
          <div className={classes.field}>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className={classes.field}>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
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
        <button className={classes.btn} onClick={register}>Register</button>
        <p className={classes.loginLink}>
          Already have an account? <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
