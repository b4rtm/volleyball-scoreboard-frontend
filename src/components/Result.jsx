const Result = ({match, teamA, teamB, websocket}) => {

    const calculatePoints = (team) => {
        const lastSet = match.timeline[match.timeline.length-1];
        for(let i = lastSet.length -1; i >= 0; i--){
            if(lastSet[i].teamId === team.id)
                return lastSet[i].point;
        }
        return 0;
    };

    const updatePoint = (team, points) => {

        const payload = {
            teamId: team.id,
            point: points,
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
            <button className="text-black text-2l font-bold bg-white-800 p-4 mr-4 rounded-lg shadow-md" onClick={() => updatePoint(teamB, calculatePoints(teamA)-1)}>-1</button>
            <button className="text-black text-7xl font-bold bg-white-800 p-4 mr-4 rounded-lg shadow-md" onClick={() => updatePoint(teamA, calculatePoints(teamA)+1)}>{calculatePoints(teamA)}</button>
            <p className="text-5xl">:</p>
            <button className="text-black text-7xl font-bold bg-white-800 p-4 ml-4 rounded-lg shadow-md" onClick={() => updatePoint(teamB, calculatePoints(teamB)+1)}>{calculatePoints(teamB)}</button>
            <button className="text-black text-2l font-bold bg-white-800 p-4 ml-4 rounded-lg shadow-md" onClick={() => updatePoint(teamB, calculatePoints(teamB)-1)}>-1</button>

        </div>
    );

};

export default Result;
