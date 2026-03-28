import React, { useState } from 'react';

import './Register.css';
import Header from '../Header/Header';

const Register = () => {
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const registerUrl = `${window.location.origin}/djangoapp/register`;

  const register = async (e) => {
    e.preventDefault();

    if (!userName || !password) {
      alert('Username and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const res = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName,
        password,
        firstName,
        lastName,
        email,
      }),
    });

    const json = await res.json();
    if (res.ok && json.status === 'Authenticated') {
      sessionStorage.setItem('username', json.userName);
      sessionStorage.setItem('firstname', firstName);
      sessionStorage.setItem('lastname', lastName);
      window.location.href = '/dealers';
      return;
    }

    if (json.error === 'Already Registered') {
      alert('Username already exists. Choose a different one.');
      return;
    }

    alert('Unable to register user right now.');
  };

  return (
    <div>
      <Header />
      <form className="register_container" onSubmit={register}>
        <div className="header">Register</div>
        <div className="inputs">
          <div className="input">
            <input
              className="input_field"
              type="text"
              placeholder="Username"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="input">
            <input
              className="input_field"
              type="text"
              placeholder="First name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="input">
            <input
              className="input_field"
              type="text"
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="input">
            <input
              className="input_field"
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input">
            <input
              className="input_field"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input">
            <input
              className="input_field"
              type="password"
              placeholder="Confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="submit_panel">
          <button className="submit" type="submit">
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
