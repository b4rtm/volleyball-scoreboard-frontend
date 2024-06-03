import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../WebSocketContext';
import { useParams } from 'react-router-dom';

const MatchDetailsPage = () => {
    const [match, setMatch] = useState(null);
    const [isSwitched, setIsSwitched] = useState(false);
    const websocket = useWebSocket();
    const { matchId } = useParams();

    useEffect(() => {
        const handleMatchMessage = (message) => {
            const data = JSON.parse(message.body);
            console.log('Received match data1:', data);

            const parsedResultDetailed = JSON.parse(data.resultDetailed);
            data.resultDetailed = parsedResultDetailed;

            const parsedPlayersTeamA = JSON.parse(data.teamA.players).players;
            data.teamA.players = parsedPlayersTeamA;

            const parsedPlayersTeamB = JSON.parse(data.teamB.players).players;
            data.teamB.players = parsedPlayersTeamB;

            console.log('Received match data2:', data);
            setMatch(data);
        };

        if (websocket) {
            websocket.onConnect = () => {
                websocket.subscribe(`/topic/matches/${matchId}`, handleMatchMessage);
                websocket.publish({ destination: `/app/getMatch/${matchId}` });
            };
        }

        return () => {
            if (websocket) {
                websocket.disconnect();
            }
        };
    }, [websocket, matchId]);

    const renderTeamA = () => {
        if (!match || !match.teamA) {
            return null;
        }

        return (
            <div>
                <p>Name: {match.teamA.name}</p>
                <p>Players:</p>
                <ul>
                    {match.teamA.players.map((player, index) => (
                        <li key={index}>{player}</li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderTeamB = () => {
        if (!match || !match.teamB) {
            return null;
        }

        return (
            <div>
                <p>Name: {match.teamB.name}</p>
                <p>Players:</p>
                <ul>
                    {match.teamB.players.map((player, index) => (
                        <li key={index}>{player}</li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderMatchDetails = () => {
        if (!match) {
            return <p>Loading...</p>;
        }

        return (
            <div>
                <h1>Match Details</h1>
                <p>Status: {match.status}</p>
                <p>Result: {match.result}</p>
                <p>Result Detailed:</p>
                <ul>
                    {match.resultDetailed.resD.map((setResult, index) => (
                        <li key={index}>{setResult}</li>
                    ))}
                </ul>
                {isSwitched ? renderTeamB() : renderTeamA()}
                {isSwitched ? renderTeamA() : renderTeamB()}
            </div>
        );
    };

    const renderSwitchSidesButton = () => {
        const switchSides = () => {
            setIsSwitched(!isSwitched);
        };

        return (
            <button onClick={switchSides}>Switch Sides</button>
        );
    };

    return (
        <div>
            {renderMatchDetails()}
            {renderSwitchSidesButton()}
        </div>
    );
};

export default MatchDetailsPage;
