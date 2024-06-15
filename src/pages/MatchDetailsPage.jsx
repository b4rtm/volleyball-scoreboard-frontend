import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../WebSocketContext';
import { useParams } from 'react-router-dom';
import TeamDetails from '../components/TeamDetails';
import Result from '../components/Result';
import MainTimer from '../components/MainTimer';

const MatchDetailsPage = () => {
    const [match, setMatch] = useState(null);
    const [isSwitched, setIsSwitched] = useState(false);
    const [currentSetTime, setCurrentSetTime] = useState("")
    const [currentSetNumber, setCurrentSetNumber] = useState(-1)
    const [wholeMatchTime, setWholeMatchTime] = useState(0);
    const websocket = useWebSocket();
    const { matchId } = useParams();

    useEffect(() => {
        const handleMatchMessage = (message) => {
            const data = JSON.parse(message.body);
            console.log('Received match data1:', data);
            const targetMatch = data.find(match => match.id === parseInt(matchId));
            console.log(targetMatch);

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

    const switchSides = () => {
        if (match && match.status !== "FINISHED") {
            const newTeamA = match.teamB;
            const newTeamB = match.teamA;
            const newResult = match.result.split(':').reverse().join(':');
            const newResultDetailed = {
                resD: match.resultDetailed.resD.map(setResult => setResult.split(':').reverse().join(':'))
            };
            setMatch({
                ...match,
                result: newResult,
                resultDetailed: newResultDetailed,
                teamA: newTeamA,
                teamB: newTeamB
            });
            setIsSwitched(!isSwitched);
        }
    };

    useEffect(() => {
        const handleCurrentSetNumberRes = (message) => {
            const data = JSON.parse(message.body);
            setCurrentSetNumber(data);
        };

        if (websocket){
            websocket.subscribe(`/topic/currentSetNumber/${matchId}`, handleCurrentSetNumberRes);
            websocket.publish({ destination: `/app/currentSetNumber/${matchId}` });
        }


    }, [match, matchId, currentSetNumber]);

    useEffect(() => {
        if (match !== null && match.status !== "FINISHED"){
            const sets = JSON.parse(match.setsTimes)
            let timeSum = 0
            sets.forEach(set => {
                if (set.setEndTime === ""){
                    const now = new Date();
                    const setStartTime = new Date(set.setStartTime);
                    timeSum += now - setStartTime;
                    
                } else {
                    const setStartTime = new Date(set.setStartTime);
                    const setEndTime = new Date(set.setEndTime);
                    timeSum += setEndTime - setStartTime;
                }
            });
            

            const intervalId = setInterval(() => {
                setWholeMatchTime(timeSum)
                timeSum += 1000
            }, 1000);

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }
    }, [matchId, currentSetNumber])

    useEffect(() => {
        let intervalId;
        if (match !== null && currentSetNumber !== -1){
            const sets = JSON.parse(match.setsTimes);

            if (sets[currentSetNumber].setEndTime === "") {
                intervalId = setInterval(() => {
                    const now = new Date();
                    const setStartTime = new Date(sets[currentSetNumber].setStartTime);
                    const duration = now - setStartTime;
                    setCurrentSetTime(duration);
                }, 1000);
            } else {
                const setStartTime = new Date(sets[currentSetNumber].setStartTime);
                const setEndTime = new Date(sets[currentSetNumber].setEndTime);
                const duration = setEndTime - setStartTime;
                setCurrentSetTime(duration)
            }
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
        
    }, [currentSetNumber, matchId])

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const renderMatchDetails = () => {
        if (!match) {
            return <p className="text-center mt-4">Loading...</p>;
        }
        let setDuration = currentSetTime ? formatTime(currentSetTime) : "00:00"

        let setMatchDuration = wholeMatchTime ? formatTime(wholeMatchTime) : "00:00"

        // Ustalenie kolorów drużyn na podstawie isSwitched
        const teamAColor = isSwitched ? "bg-green-100" : "bg-blue-100";
        const teamBColor = isSwitched ? "bg-blue-100" : "bg-green-100";

        return (
            <div className="bg-white p-8 rounded-lg shadow-lg">

                <MainTimer/>
                <h2>Current set time: {setDuration}</h2>
                <h2>Match time: {setMatchDuration}</h2>
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
                    <TeamDetails team={match.teamA} bgColor={teamAColor} />
                    <Result match={match} teamA={match.teamA} teamB={match.teamB} websocket={websocket} />
                    <TeamDetails team={match.teamB} bgColor={teamBColor} />
                </div>

                <div className='flex justify-center'>
                    <button 
                        onClick={switchSides}
                        className="mt-8 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
                    >
                        Switch Sides
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="mx-auto mt-8">
            {renderMatchDetails()}
        </div>
    );
};

export default MatchDetailsPage;
