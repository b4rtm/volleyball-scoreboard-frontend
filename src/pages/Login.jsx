import React from 'react';
import { useState } from 'react';
import { useWebSocket } from '../WebSocketContext';


const Login = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const websocket = useWebSocket();

    const handleSubmit = (event) => {
      event.preventDefault();
      if (websocket) {
        websocket.publish({
            destination: '/app/auth',
            body: JSON.stringify({ login, password }),
        });
        websocket.subscribe('/topic/authRes', message =>
          console.log(`Received: ${message.body}`)
        );      
      }
      else{
        console.log('lipa')
      }
    };

  return (
<div className="container mx-auto max-w-sm p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Logowanie</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="login" className="block text-gray-700">Login</label>
          <input
            id="login"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Hasło</label>
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