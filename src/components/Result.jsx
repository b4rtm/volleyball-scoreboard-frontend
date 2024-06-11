const Result = ({match, teamA, teamB, websocket}) => {

    const calculatePoints = (team) => {
        const lastSet = match.timeline[match.timeline.length-1];
        for(let i = lastSet.length -1; i >= 0; i--){
            if(lastSet[i].teamId === team.id)
                return lastSet[i].point;
        }
        return 0;
    };

    const addPoint = (team) => {

        const payload = {
            teamId: team.id,
            point: calculatePoints(team) + 1,
            opponentBreak: 0
        };
        console.log(payload);
        websocket.publish({
            destination: `/app/updateScore/${match.id}`,
            body: JSON.stringify(payload),
        });
    }

    return (
        <div className="flex items-center justify-between">
            <p className="text-black text-7xl font-bold bg-white-800 p-4 mr-4 rounded-lg shadow-md" onClick={() => addPoint(teamA)}>{calculatePoints(teamA)}</p>
            <p className="text-5xl">:</p>
            <p className="text-black text-7xl font-bold bg-white-800 p-4 ml-4 rounded-lg shadow-md" onClick={() => addPoint(teamB)}>{calculatePoints(teamB)}</p>
        </div>
    );

};

export default Result;
