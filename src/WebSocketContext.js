import React, { createContext, useContext, useEffect, useState } from 'react';
import * as stomp from '@stomp/stompjs';
import Cookies from 'js-cookie';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [websocket, setWebsocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const client = new stomp.Client({
            brokerURL: 'wss://http://volleyball-scoreboard-backend.onrender.com:8080/websocket',
        
            
            onConnect: () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
                setWebsocket(client);

                client.subscribe('/user/topic/errors', (message) => {
                    console.error('Error: ' + message.body);
                    alert('Error: ' + message.body);
                })
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: (event) => {
                console.log('WebSocket closed', event);
                setIsConnected(false);
                setWebsocket(null);
            },
            onError: (error) => {
                console.error('WebSocket error:', error);
            },
        });

        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
                console.log('Disconnected from WebSocket');
            }
        };
    }, []);

    return (    
        <WebSocketContext.Provider value={{ websocket, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
