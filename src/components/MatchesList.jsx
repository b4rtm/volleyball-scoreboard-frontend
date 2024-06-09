import { useEffect, useState } from "react";
import { useWebSocket } from '../WebSocketContext';


const MatchesList = () => {
    const TEXT_WIDTH_PX = 9

    const [matches, setMatches] = useState([])
    const [loadingMatches, setLoadingMatches] = useState(true)

    const websocket = useWebSocket();

    useEffect(() => {
        if (!websocket) {
            return;
        } 
    
        const handleGettingMatches = (message) => {
            const data = JSON.parse(message.body);
            console.log(data)
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
        <div className="space-y-6 flex flex-col justify-center items-center">
            {
                matches.map((match, index) => {
                    if (match.timeline !== null) {
                        let maxWidth = Math.max(match.teamA.name.length, match.teamB.name.length)

                        const sets = JSON.parse(match.timeline);
                        return sets.map((set, setIndex) => {
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
                                    teamBRoundsDiv.push(<div key={`teamB-${roundIndex}`} className="result-grid-element w-8 h-8 flex items-center justify-center bg-transparent"></div>)
                                    teamARounds.push(round.point)
                                } 
                                else if (round.teamId === match.teamB.id) {
                                    teamBRoundsDiv.push(
                                        <div key={roundIndex} className="result-grid-element w-8 h-8 flex items-center justify-center bg-gray-400">
                                            {round.point}
                                        </div>
                                    );
                                    teamARoundsDiv.push(<div key={`teamB-${roundIndex}`} className="result-grid-element w-8 h-8 flex items-center justify-center bg-transparent"></div>)
                                    teamBRounds.push(round.point)
                                }
                            });
    
                            return (
                                <div key={setIndex} className="mb-4 inline-block items-center bg-gray-200 p-4">
                                    <h2 className="text-lg font-bold">Set {setIndex + 1}: {Math.max(...teamARounds)}-{Math.max(...teamBRounds)} (time: )</h2>
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
                            );
                        });
                    }
                })
            }
        </div>
    );
}

export default MatchesList;
