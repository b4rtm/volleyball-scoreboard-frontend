import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useWebSocket } from '../WebSocketContext';

const AddMatch = () => {
    const [teams, setTeams] = useState([]);
    const [teamA, setTeamA] = useState('');
    const [teamB, setTeamB] = useState('');
    const [date, setDate] = useState(moment().format('YYYY-MM-DDTHH:mm'));
    const [status, setStatus] = useState('IN_PROGRESS');
    const [setsToWin, setSetsToWin] = useState(3);
    const [pointsToWinSet, setPointsToWinSet] = useState(25);
    const [isTieBreak, setIsTieBreak] = useState(true);
    const [pointsToWinTieBreak, setPointsToWinTieBreak] = useState(15);

    const websocket = useWebSocket();

    useEffect(() => {
        if (!websocket) {
            return;
        } 
    
        const handleTeamsMessage = (message) => {
            const data = JSON.parse(message.body);
            setTeams(data);
        };
    
        // Odbierz drużyny po nawiązaniu połączenia
        websocket.onConnect = () => {
            websocket.subscribe('/topic/teams', handleTeamsMessage);
            websocket.publish({ destination: '/app/getTeams' });
        };
    
        return () => {
            websocket.disconnect(); // Dodaj funkcję do rozłączania WebSocket
        };
    }, [websocket]);

    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        const now = moment();
        setDate(selectedDate);
        setStatus(moment(selectedDate) > now ? 'PLANNED' : 'IN_PROGRESS');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!websocket) {
            console.log('WebSocket is not connected');
            return;
        }

        const match = {
            teamA,
            teamB,
            date,
            status,
            setsToWin,
            pointsToWinSet,
            isTieBreak,
            pointsToWinTieBreak
        };
        
        websocket.publish({
            destination: '/app/addMatch',
            body: JSON.stringify(match),
        });
    };

    return (
        <div className="container mx-auto max-w-sm p-4">
            <h1 className="text-2xl font-bold text-center mb-4">Add new match</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="teamA" className="block text-gray-700">Team A</label>
                    <select
                        id="teamA"
                        value={teamA}
                        onChange={(e) => setTeamA(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select team</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.name}>{team.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="teamB" className="block text-gray-700">Team B</label>
                    <select
                        id="teamB"
                        value={teamB}
                        onChange={(e) => setTeamB(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select team</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.name}>{team.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700">Date and time</label>
                    <input
                        type="datetime-local"
                        id="date"
                        value={date}
                        onChange={handleDateChange}
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="setsToWin" className="block text-gray-700">Sets to win</label>
                    <input
                        type="number"
                        id="setsToWin"
                        value={setsToWin}
                        onChange={(e) => setSetsToWin(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="pointsToWinSet" className="block text-gray-700">Points to win a set</label>
                    <input
                        type="number"
                        id="pointsToWinSet"
                        value={pointsToWinSet}
                        onChange={(e) => setPointsToWinSet(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="isTieBreak" className="block text-gray-700">Is tie-break?</label>
                    <select
                        id="isTieBreak"
                        value={isTieBreak}
                        onChange={(e) => setIsTieBreak(e.target.value === 'true')}
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {isTieBreak && (
                    <div className="mb-4">
                        <label htmlFor="pointsToWinTieBreak" className="block text-gray-700">Points to win tie-break</label>
                        <input
                            type="number"
                            id="pointsToWinTieBreak"
                            value={pointsToWinTieBreak}
                            onChange={(e) => setPointsToWinTieBreak(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-md bg-blue-500 text-white font-bold hover:bg-blue-600">
                    Add match
                </button>
            </form>
        </div>
    );
};

export default AddMatch;
