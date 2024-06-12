const Result = ({match, teamA, teamB, websocket}) => {

    const calculatePoints = (team) => {
        if(match.timeline.length === 0)
            return 0;
        const lastSet = match.timeline[match.timeline.length-1];

        for(let i = lastSet.length -1; i >= 0; i--){
            if(lastSet[i].teamId === team.id)
                return lastSet[i].point;
        }
        return 0;
    };

    const calculateTimeouts = (team) => {
        if(match.timeline.length === 0)
            return 0;
        const lastSet = match.timeline[match.timeline.length-1];
        const timeouts = lastSet.filter(score => score.teamId !== team.id && score.opponentBreak === 1);
        return timeouts.length;
    };

    const updatePoint = (team, points) => {
        if(match.status !== "FINISHED"){
            const payload = {
                teamId: team.id,
                point: points,
                opponentBreak: 0
            };
            websocket.publish({
                destination: `/app/updateScore/${match.id}`,
                body: JSON.stringify(payload),
            });
        }
    }

    const takeTimeout = (team) => {
        if(match.status !== "FINISHED"){
            websocket.publish({
                destination: `/app/timeout/${match.id}`,
                body: JSON.stringify(team.id),
            });
        }
    }

    const endSet = () => {
        websocket.publish({
            destination: `/app/endSet/${match.id}`
        });
    }

    const endMatch = () => {
        websocket.publish({
            destination: `/app/endMatch/${match.id}`
        });
    }

    const isEndSet = () => {
        const pointToEndSet = match.pointsToWinSet;
        const teamAPoints = calculatePoints(match.teamA);
        const teamBPoints = calculatePoints(match.teamB);

        if(teamAPoints >= pointToEndSet && teamAPoints > teamBPoints+1)
            return true;
        if(teamBPoints >= pointToEndSet && teamBPoints > teamAPoints+1)
            return true;
        return false;
    }


    const isEndMatch = () => {
        let pointToEndSet;
        match.isTieBreak ? pointToEndSet = match.pointsToWinTieBreak : pointToEndSet = match.pointsToWinSet;
        
        const teamAPoints = calculatePoints(match.teamA);
        const teamBPoints = calculatePoints(match.teamB);

        const parts = match.result.split(':');
        const teamAScore = parseInt(parts[0].trim(), 10);
        const teamBScore = parseInt(parts[1].trim(), 10);

        if(teamAPoints >= pointToEndSet && teamAPoints > teamBPoints+1 && teamAScore + 1 === match.setsToWin)
            return true;

        if(teamBPoints >= pointToEndSet && teamBPoints > teamAPoints+1 && teamBScore + 1 === match.setsToWin)
            return true;

        return false;
    }

    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 p-4">
            {isEndSet() && !isEndMatch() && match.status !== "FINISHED" && (<button className="p-4" onClick={() => endSet()}>End set</button>)}
            {isEndMatch() && (<button className="p-4" onClick={() => endMatch()}>End match</button>)}

            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-col justify-center">
                    <button className="text-white text-2l font-bold bg-blue-500 p-4 mr-4 rounded-lg shadow-md" onClick={() => takeTimeout(teamA)}>T</button>
                    <p className="text-black text-1l bg-white-800 p-4 mr-4">{calculateTimeouts(teamA)}/2</p>
                </div>

                <button className="text-black text-2l font-bold bg-white-800 p-4 mr-4 rounded-lg shadow-md" onClick={() => updatePoint(teamB, calculatePoints(teamA)-1)}>-1</button>
                <button className="text-black text-7xl font-bold bg-white-800 p-4 mr-4 rounded-lg shadow-md" onClick={() => updatePoint(teamA, calculatePoints(teamA)+1)}>{calculatePoints(teamA)}</button>
                <p className="text-5xl">:</p>
                <button className="text-black text-7xl font-bold bg-white-800 p-4 ml-4 rounded-lg shadow-md" onClick={() => updatePoint(teamB, calculatePoints(teamB)+1)}>{calculatePoints(teamB)}</button>
                <button className="text-black text-2l font-bold bg-white-800 p-4 ml-4 rounded-lg shadow-md" onClick={() => updatePoint(teamB, calculatePoints(teamB)-1)}>-1</button>

                <div className="flex flex-col justify-center">
                    <button className="text-white text-2l font-bold bg-blue-500 p-4 ml-4 rounded-lg shadow-md" onClick={() => takeTimeout(teamB)}>T</button>
                    <p className="text-black text-1l bg-white-800 p-4 ml-4">{calculateTimeouts(teamB)}/2</p>
                </div>
            </div>
        </div>
    );

};

export default Result;
