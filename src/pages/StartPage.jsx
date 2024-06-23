import React, { useEffect, useState } from 'react';
import AddMatch from '../components/AddMatch';
import UserInfoNav from '../components/UserInfoNav';
import MatchesList from '../components/MatchesList';
import { useWebSocket } from '../WebSocketContext';
import ManageTeams from '../components/ManageTeams';
import Cookies from 'js-cookie';


const StartPage = () => {
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const { websocket, isConnected } = useWebSocket();

    useEffect(() => {
        const handleTeamsMessage = (message) => {
            const data = JSON.parse(message.body);
            setTeams(data);
        };

        const handleGettingMatches = (message) => {
            const data = JSON.parse(message.body);
            setMatches(data);
        };

        let token = Cookies.get('userData');
        token = JSON.parse(token).userToken

        if (isConnected && websocket) {
            websocket.subscribe('/topic/teams', handleTeamsMessage);
            websocket.publish({ 
                destination: '/app/getTeams',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            websocket.subscribe('/topic/matches', handleGettingMatches);
            websocket.publish({ 
                destination: '/app/getMatches',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }, [isConnected, websocket]);

    return (
        <div>
            <UserInfoNav />
            <div className='flex mb-20'>
                <AddMatch teams={teams} websocket={websocket} />
                <ManageTeams teams={teams} websocket={websocket} />
            </div>
            <MatchesList matches={matches} websocket={websocket} />
        </div>
    );
};

export default StartPage;
