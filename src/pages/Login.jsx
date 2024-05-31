import React from 'react';
import { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Zaloguj użytkownika
    console.log(`Login: ${email}, Hasło: ${password}`);
  };

  return (
<div className="container mx-auto max-w-sm p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Logowanie</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 underline">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 underline">Hasło</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md bg-blue-500 text-white font-bold hover:bg-blue-600"
        >
          Zaloguj się
        </button>
      </form>
    </div>
  );
};

export default Login;