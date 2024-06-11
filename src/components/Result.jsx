const Result = ({match, teamA, teamB, websocket}) => {

    const calculatePoints = (team) => {
        const lastSet = match.timeline[match.timeline.length-1];
        for(let i = lastSet.length -1; i >= 0; i--){
            if(lastSet[i].teamId === team.id)
                return lastSet[i].point;
        }
        return 0;
    };

    const calculateTimeouts = (team) => {
        const lastSet = match.timeline[match.timeline.length-1];
        const timeouts = lastSet.filter(score => score.teamId !== team.id && score.opponentBreak === 1);
        return timeouts.length;
    };

    const updatePoint = (team, points) => {

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

    const takeTimeout = (team) => {

        websocket.publish({
            destination: `/app/timeout/${match.id}`,
            body: JSON.stringify(team.id),
        });
    }

    return (
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
    );

};

export default Result;
