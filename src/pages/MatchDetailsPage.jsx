import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../WebSocketContext';
import { useParams } from 'react-router-dom';
import TeamDetails from '../components/TeamDetails';
import Result from '../components/Result';

const MatchDetailsPage = () => {
    const [match, setMatch] = useState(null);
    const [isSwitched, setIsSwitched] = useState(false);
    const websocket = useWebSocket();
    const { matchId } = useParams();

    useEffect(() => {
        const handleMatchMessage = (message) => {
            const data = JSON.parse(message.body);
            console.log('Received match data1:', data);
            const targetMatch =  data.find(match => match.id === parseInt(matchId));
            console.log(targetMatch)

            const parsedResultDetailed = JSON.parse(targetMatch.resultDetailed);
            targetMatch.resultDetailed = parsedResultDetailed;

            const parsedPlayersTeamA = JSON.parse(targetMatch.teamA.players).players;
            targetMatch.teamA.players = parsedPlayersTeamA;

            const parsedPlayersTeamB = JSON.parse(targetMatch.teamB.players).players;
            targetMatch.teamB.players = parsedPlayersTeamB;

            const parsedTimeline = JSON.parse(targetMatch.timeline);
            targetMatch.timeline = parsedTimeline;

            console.log('Received match data2:', targetMatch);
            setMatch(targetMatch);
        };

        if (websocket) {
            websocket.onConnect = () => {
                websocket.subscribe(`/topic/matches`, handleMatchMessage);
                websocket.publish({ destination: `/app/getMatches` });
            };
        }

        return () => {
            if (websocket) {
                websocket.disconnect();
            }
        };
    }, [websocket, matchId]);

    useEffect(() =>{
        if(websocket && match){
            if(match.timeline.length % 2 !== 0){
                setIsSwitched(true);
            }
            else{
                setIsSwitched(false);
            }
        }
    }, [match, websocket])

    const renderMatchDetails = () => {
        if (!match) {
            return <p className="text-center mt-4">Loading...</p>;
        }

        return (
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4 text-center">Match Details</h1>
                <p className='text-center'><span className="font-semibold">Status:</span> {match.status}</p>
                <p className='text-center text-6xl font-bold'>{match.result}</p>
                <p className="mt-4 font-semibold text-center">Result Detailed</p>
                <ul className="list-decimal list-inside ml-4 text-center">
                    {match.resultDetailed.resD.map((setResult, index) => (
                        <li key={index}>{setResult}</li>
                    ))}
                </ul>
                
                <div className="mt-4 flex justify-between">
                    {isSwitched ? (
                        <>
                            <TeamDetails team={match.teamB} bgColor="bg-green-100"/>
                            <Result match={match} teamA = {match.teamB} teamB = {match.teamA} websocket={websocket}/>
                            <TeamDetails team={match.teamA} bgColor="bg-blue-100"/>
                            
                        </>
                    ) : (
                        <>
                            <TeamDetails team={match.teamA} bgColor="bg-blue-100"/>
                            <Result match={match} teamA = {match.teamA} teamB = {match.teamB} websocket={websocket}/>
                            <TeamDetails team={match.teamB} bgColor="bg-green-100"/>
                        </>
                    )}
                     
                </div>
                {renderSwitchSidesButton()}
            </div>
        );
    };



    const renderSwitchSidesButton = () => {
        const switchSides = () => {
            if(match.status !== "FINISHED"){
                setIsSwitched(!isSwitched);
            }
        };

        return (
            <div className='flex justify-center'>
                <button 
                    onClick={switchSides}
                    className="mt-8 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
                >
                    Switch Sides
                </button>
            </div>
            
        );
    };

    return (
        <div className="max-w-7xl mx-auto mt-8">
            {renderMatchDetails()}
        </div>
    );
};

export default MatchDetailsPage;
