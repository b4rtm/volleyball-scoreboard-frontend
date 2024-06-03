import { useEffect, useState } from "react";
import { useWebSocket } from '../WebSocketContext';


const MatchesList = () => {

    const [matches, setMatches] = useState([])
    const [loadingMatches, setLoadingMatches] = useState(true)

    const websocket = useWebSocket();

    useEffect(() => {
        if (!websocket) {
            return;
        } 
    
        const handleGettingMatches = (message) => {
            const data = JSON.parse(message.body);
            setMatches(data);
            setLoadingMatches(false)
        };
    
        websocket.onConnect = () => {
            websocket.subscribe('/topic/matches', handleGettingMatches);
            websocket.publish({ destination: '/app/getMatches' });
        };
    
        return () => {
            websocket.disconnect();
        };
    }, [websocket]);


    {loadingMatches && (
        <div>
            Loading matches...
        </div>
    )}

    return (
        <div className="space-y-6">
            {
                matches.map((match, index) => {
                    if (match.timeline !== null) {
                        const sets = JSON.parse(match.timeline);
                        return sets.map((set, setIndex) => {
                            const teamARounds = [];
                            const teamBRounds = [];
                            set.forEach((round, roundIndex) => {
                                console.log(match)
                                if (round.teamId === match.teamA.id) {
                                    teamARounds.push(
                                        <div key={roundIndex} className="result-grid-element">
                                            Point: {round.point}
                                        </div>
                                    );
                                } 
                                else if (round.teamId === match.teamB.id) {
                                    teamBRounds.push(
                                        <div key={roundIndex} className="result-grid-element">
                                            Point: {round.point}
                                        </div>
                                    );
                                }
                            });
    
                            return (
                                <div key={setIndex} className="mb-4">
                                    <h2 className="text-lg font-bold">Set {setIndex + 1}:</h2>
                                    <div className="team-a-row mb-2">
                                        <div className="font-semibold">{match.team1Name}</div>
                                        <div className="grid grid-cols-12 gap-1 mt-2">
                                            {teamARounds}
                                        </div>
                                    </div>
                                    <div className="team-b-row mb-2">
                                        <div className="font-semibold">{match.team2Name}</div>
                                        <div className="grid grid-cols-12 gap-1 mt-2">
                                            {teamBRounds}
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    }
                })
            }
        </div>
    );
}

export default MatchesList;
