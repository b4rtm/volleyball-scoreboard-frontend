import React, { createContext, useContext, useEffect, useState } from 'react';
import * as stomp from '@stomp/stompjs';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [websocket, setWebsocket] = useState(null);

    useEffect(() => {
        const client = new stomp.Client({
            brokerURL: 'ws://127.0.0.1:8080/websocket',
            onConnect: () => {
                console.log('Connected to WebSocket');
            },
        });

        client.activate();
        setWebsocket(client);

        return () => {
            client.deactivate();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={websocket}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
