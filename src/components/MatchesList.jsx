import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';

const MatchesList = ({ matches, websocket }) => {
    const TEXT_WIDTH_PX = 9
    const LONGEST_TEAM_NAME_PADDING = 3

    const [visibleTables, setVisibleTables] = useState({});
    const [setTimes, setSetTimes] = useState({})

    useEffect(() => {
        if (!websocket) {
            console.log('WebSocket is not connected');
            return;
        }
        
        let token = Cookies.get('userData');
        token = JSON.parse(token).userToken
    
        websocket.onConnect = () => {
            websocket.publish({ 
                destination: '/app/getMatches',
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
        };
    }, [websocket]);

    useEffect(() => {
        const intervals = matches.reduce((acc, match) => {
            const sets = JSON.parse(match.setsTimes);
            sets.forEach((set, setIndex) => {
                if (set.setEndTime === "") {
                    const interval = setInterval(() => {
                        const now = new Date();
                        const setStartTime = new Date(set.setStartTime);
                        const duration = now - setStartTime;
                        setSetTimes(prevState => ({
                            ...prevState,
                            [`${match.id}-${setIndex}`]: duration
                        }));
                    }, 1000);
                    acc.push(interval);
                } else {
                    const setStartTime = new Date(set.setStartTime);
                    const setEndTime = new Date(set.setEndTime);
                    const duration = setEndTime - setStartTime;
                    setSetTimes(prevState => ({
                        ...prevState,
                        [`${match.id}-${setIndex}`]: duration
                    }));
                }
            });
            return acc;
        }, []);

        return () => intervals.forEach(clearInterval);
    }, [matches]);

    const copyMatchToClipboard = (match) => {
        const sets = JSON.parse(match.timeline);
        const longestTeamNameLength = Math.max(match.teamA.name.length, match.teamB.name.length) + LONGEST_TEAM_NAME_PADDING
        let matchDetails = ""
        matchDetails = addHeaderPaddingSpaces(longestTeamNameLength, matchDetails);
        matchDetails = addMatchHeader(matchDetails, sets);
        matchDetails = assignPointsToTeams(sets, match, matchDetails, longestTeamNameLength);
        
        navigator.clipboard.writeText(matchDetails).then(() => {
            alert('Skopiowano dane o meczu do schowka');
        }, (err) => {
            console.error('Nie udało się skopiować danych meczu do schowka: ', err);
        });
    };

    const deleteMatch = (match) => {
        let token = Cookies.get('userData');
        token = JSON.parse(token).userToken

        websocket.publish({
            destination: `/app/deleteMatch/${match.id}`,
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
    }

    const toggleTableVisibility = (matchId) => {
        setVisibleTables(prevState => ({
            ...prevState,
            [matchId]: !prevState[matchId]
        }));
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        minutes = minutes < 0 ? 0 : minutes;
        let seconds = totalSeconds % 60;
        seconds = seconds < 0 ? 0 : seconds;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 flex flex-col justify-center items-center mb-5">
            {
                matches.map((match, index) => {
                    if (match.timeline !== null) {
                        let maxWidth = Math.max(match.teamA.name.length, match.teamB.name.length);
                        const sets = JSON.parse(match.timeline);
                        const totalMatchTime = sets.reduce((total, set, setIndex) => {
                            const setTimeKey = `${match.id}-${setIndex}`;
                            const setTime = setTimes[setTimeKey];
                            if (setTime) {
                                total += setTime;
                            }
                            return total
                        }, 0);

                        const formattedTotalMatchTime = formatTime(totalMatchTime)

                        return (
                            <div key={index} className="match-container flex flex-col items-center shadow-lg p-5">
                                <div className="flex">
                                    <Link to={`/matches/${match.id}`}>
                                        <h2 className="match-status font-bold p-4">
                                            {match.teamA.name + " vs " + match.teamB.name + " " + formattedTotalMatchTime + " (" + match.status + ")"}
                                        </h2>
                                    </Link>
                                    <button className="bg-gray-500 text-white px-2 py-1 rounded mt-4 p-3 mb-4" onClick={() => toggleTableVisibility(match.id)}>
                                        {visibleTables[match.id] ? "Hide table" : "Show table"}
                                    </button>
                                </div>
                                
                                {sets.map((set, setIndex) => {
                                    const teamARoundsDiv = [];
                                    const teamARounds = [];
                                    const teamBRoundsDiv = [];
                                    const teamBRounds = [];
                                    set.forEach((round, roundIndex) => {
                                        if (round.teamId === match.teamA.id) {
                                            teamARoundsDiv.push(
                                                <div key={roundIndex} className="result-grid-element w-8 h-8 flex items-center justify-center bg-gray-400">
                                                    {round.point}
                                                </div>
                                            );

                                            teamBRoundsDiv.push(
                                                <div key={`teamB-${roundIndex}`} className={`result-grid-element w-8 h-8 flex items-center justify-center ${round.opponentBreak === 1 ? 'bg-yellow-400' : ''}`}>
                                                    {round.opponentBreak === 1 ? 'T' : null}
                                                </div>
                                            );
                                            teamARounds.push(round.point);
                                        } else if (round.teamId === match.teamB.id) {
                                            teamBRoundsDiv.push(
                                                <div key={roundIndex} className="result-grid-element w-8 h-8 flex items-center justify-center bg-gray-400">
                                                    {round.point}
                                                </div>
                                            );
                                            teamARoundsDiv.push(
                                                <div key={`teamB-${roundIndex}`} className={`result-grid-element w-8 h-8 flex items-center justify-center ${round.opponentBreak === 1 ? 'bg-yellow-400' : ''}`}>
                                                    {round.opponentBreak === 1 ? 'T' : null}
                                                </div>
                                            );
                                            teamBRounds.push(round.point);
                                        }
                                    });

                                    let setDuration = setTimes[`${match.id}-${setIndex}`] ? formatTime(setTimes[`${match.id}-${setIndex}`]) : "00:00"
                                    
                                    if (visibleTables[match.id]) {
                                        return (
                                            <div key={setIndex} className="mb-4 inline-block items-center bg-gray-200 p-4">
                                                <h2 className="text-lg font-bold">Set {setIndex + 1}: {Math.max(...teamARounds)}-{Math.max(...teamBRounds)} (time: {setDuration})</h2>
                                                <div className="team-a-row mb-2">
                                                    <div className="inline-grid grid-flow-col auto-cols-max gap-1 mt-2">
                                                        <div className="team-name" style={{ width: `${maxWidth * TEXT_WIDTH_PX}px` }}>
                                                            {match.teamA.name}
                                                        </div>
                                                        {teamARoundsDiv}
                                                    </div>
                                                </div>
                                                <div className="team-b-row flex flex-row mb-2">
                                                    <div className="inline-grid grid-flow-col auto-cols-max gap-1 mt-2">
                                                        <div className="team-name" style={{ width: `${maxWidth * TEXT_WIDTH_PX}px` }}>
                                                            {match.teamB.name}
                                                        </div>
                                                        {teamBRoundsDiv}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })}
                                <button className="bg-green-500 text-white px-2 py-1 rounded mt-4 p-3" onClick={() => copyMatchToClipboard(match)}>
                                    Copy result to clipboard
                                </button>
                                <button className="bg-red-500 text-white px-2 py-1 rounded mt-4 p-3" onClick={() => deleteMatch(match)}>
                                    Delete match
                                </button>
                            </div>
                        );
                    }
                })
            }
        </div>
    );
}

export default MatchesList;
function assignPointsToTeams(sets, match, matchDetails, longestTeamNameLength) {
    const teamAPoints = [];
    const teamBPoints = [];

    let teamAWonSets = 0;
    let teamBWonSets = 0;

    matchDetails = addTeamLabel(matchDetails, longestTeamNameLength, match.teamA.name);

    sets.forEach(rounds => {
        assignPointToTeamByRound(rounds, match, teamAPoints, teamBPoints);

        if (teamAPoints[teamAPoints.length - 1] > teamBPoints[teamBPoints.length - 1]) {
            teamAWonSets++;
        } else {
            teamBWonSets++;
        }
    });

    matchDetails = addTeamPointsInSets(teamAPoints, teamAWonSets, matchDetails)
    matchDetails = addTeamLabel(matchDetails, longestTeamNameLength, match.teamB.name)
    matchDetails = addTeamPointsInSets(teamBPoints, teamBWonSets, matchDetails)

    matchDetails += format(new Date(match.date), 'yyyy-MM-dd HH:mm')
    return matchDetails;
}

function addTeamPointsInSets(teamPoints, teamWonSets, matchDetails) {
    teamPoints.forEach(setPoints => {
        if (setPoints < 10) {
            matchDetails += " ";
        }
        matchDetails += setPoints + "  |  ";
    });
    matchDetails += "  " + teamWonSets
    matchDetails += "\n"
    return matchDetails;
}

function assignPointToTeamByRound(rounds, match, teamAPoints, teamBPoints) {
    let teamASetPoints = rounds
        .filter(round => round.teamId === match.teamA.id)
        .map(round => round.point);

    let teamBSetPoints = rounds
        .filter(round => round.teamId === match.teamB.id)
        .map(round => round.point);

    teamAPoints.push(Math.max(...teamASetPoints));
    teamBPoints.push(Math.max(...teamBSetPoints));
}

function addTeamLabel(matchDetails, longestTeamName, teamName) {
    const spacesToAdd = longestTeamName - teamName.length
    matchDetails += `${teamName}`;
    for (let spaceCounter = 0; spaceCounter < spacesToAdd; spaceCounter++) {
        matchDetails += " ";
    }
    return matchDetails;
}

function addHeaderPaddingSpaces(longestTeamNameLength, matchDetails) {
    for (let spaceCounter = 0; spaceCounter < longestTeamNameLength; spaceCounter++) {
        matchDetails += " ";
    }
    return matchDetails;
}

function addMatchHeader(matchDetails, sets) {
    matchDetails += sets.map((_, index) => `S${index + 1}`).join("  |  ");
    matchDetails += "  |  TOTAL"
    matchDetails += "\n";
    return matchDetails;
}
