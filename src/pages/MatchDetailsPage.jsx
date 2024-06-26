import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../WebSocketContext';
import { useParams } from 'react-router-dom';
import TeamDetails from '../components/TeamDetails';
import Result from '../components/Result';
import MainTimer from '../components/MainTimer';
import Cookies from 'js-cookie';

const MatchDetailsPage = () => {
    const [match, setMatch] = useState(null);
    const [isSwitched, setIsSwitched] = useState(false);
    const [currentSetTime, setCurrentSetTime] = useState("")
    const [currentSetNumber, setCurrentSetNumber] = useState(-1)
    const [wholeMatchTime, setWholeMatchTime] = useState(0);
    const { websocket, isConnected } = useWebSocket();
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

        let token = Cookies.get('userData');
        token = JSON.parse(token).userToken

        if (isConnected && websocket) {
                websocket.subscribe(`/topic/matches`, handleMatchMessage);
                websocket.publish({ 
                    destination: `/app/getMatches`,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });
        }
    }, [isConnected, websocket, matchId]);

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
            let token = Cookies.get('userData');
            token = JSON.parse(token).userToken

            websocket.publish({ 
                destination: `/app/currentSetNumber/${matchId}`,
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
        }


    }, [match, matchId, currentSetNumber, websocket]);

    useEffect(() => {
        let intervalId;
        if (match !== null){
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
            

            if (match.status !== "FINISHED") {
                intervalId = setInterval(() => {
                    setWholeMatchTime(timeSum + 1000);
                    timeSum += 1000;
                }, 1000);
            } else {
                let totalMatchTime = 0
                sets.forEach(set => {
                    const setStartTime = new Date(set.setStartTime);
                    const setEndTime = new Date(set.setEndTime);
                    const duration = setEndTime - setStartTime;

                    totalMatchTime += duration
                });
                setWholeMatchTime(totalMatchTime)
            }

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }
    }, [matchId, currentSetNumber, match])

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
        
    }, [currentSetNumber, matchId, match])

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        minutes = minutes < 0 ? 0 : minutes;
        let seconds = totalSeconds % 60;
        seconds = seconds < 0 ? 0 : seconds;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const renderMatchDetails = () => {
        if (!match) {
            return <p className="text-center mt-4">Loading...</p>;
        }
        let setDuration = currentSetTime ? formatTime(currentSetTime) : "00:00"

        let setMatchDuration = wholeMatchTime ? formatTime(wholeMatchTime) : "00:00"

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
