import React, { useEffect, useState } from 'react';
import AddMatch from '../components/AddMatch';
import UserInfoNav from '../components/UserInfoNav';
import { useWebSocket } from '../WebSocketContext';
import ManageTeams from '../components/ManageTeams';

const StartPage = () => {
    const [teams, setTeams] = useState([]);
    const websocket = useWebSocket();

    useEffect(() => {
        const handleTeamsMessage = (message) => {
            const data = JSON.parse(message.body);
            console.log('Received teams data:', data);
            setTeams(data);
        };

        if (websocket) {
            websocket.onConnect = () => {
                websocket.subscribe('/topic/teams', handleTeamsMessage);
                websocket.publish({ destination: '/app/getTeams' });
            };
        }

        return () => {
            if (websocket) {
                websocket.disconnect();
            }
        };
    }, [websocket]);

    return (
        <div>
            <UserInfoNav />
            <h1 className="text-2xl font-bold text-center mb-4">Start Page</h1>
            <AddMatch teams={teams} websocket={websocket}/>
            <ManageTeams teams={teams} websocket={websocket} />
        </div>
    );
};

export default StartPage;