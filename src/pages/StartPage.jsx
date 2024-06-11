import React, { useEffect, useState } from 'react';
import AddMatch from '../components/AddMatch';
import UserInfoNav from '../components/UserInfoNav';
import MatchesList from '../components/MatchesList';
import { useWebSocket } from '../WebSocketContext';
import ManageTeams from '../components/ManageTeams';
import MainTimer from '../components/MainTimer';

const StartPage = () => {
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([])

    const websocket = useWebSocket();

    useEffect(() => {
        const handleTeamsMessage = (message) => {
            const data = JSON.parse(message.body);
            console.log('Received teams data:', data);
            setTeams(data);
        };

        const handleGettingMatches = (message) => {
            const data = JSON.parse(message.body);
            setMatches(data);
        };

        if (websocket) {
            websocket.onConnect = () => {
                websocket.subscribe('/topic/teams', handleTeamsMessage);
                websocket.publish({ destination: '/app/getTeams' });

                websocket.subscribe('/topic/matches', handleGettingMatches);
                websocket.publish({ destination: '/app/getMatches' });
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
            <MainTimer/>
            <h1 className="text-2xl font-bold text-center mb-4">Start Page</h1>
            <AddMatch teams={teams} websocket={websocket}/>
            <ManageTeams teams={teams} websocket={websocket} />
            <MatchesList matches={matches} websocket={websocket}/>
        </div>
    );
};

export default StartPage;