import React from 'react';
import { useState, useEffect } from 'react';
import * as stomp from "@stomp/stompjs";


const Login = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [websocket, setWebsocket] = useState('');


    useEffect(() => {
        const websocket = new stomp.Client({
            brokerURL: 'ws://127.0.0.1:8080/websocket',
            onConnect: () => {
              websocket.subscribe('/topic/authRes', message =>
                console.log(`Received: ${message.body}`)
              );
              
            },
          });
        
          websocket.activate();

          setWebsocket(websocket);
    }, []);


    const handleSubmit = (event) => {
      event.preventDefault();
      websocket.publish({ destination: '/app/auth', body: JSON.stringify({'login': login, "password": password})});
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