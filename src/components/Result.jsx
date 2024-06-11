
const Result = ({match}) => {

    const calculatePoints = (team) => {
        const lastSet = match.timeline[match.timeline.length-1];
        for(let i = lastSet.length -1; i >= 0; i--){
            if(lastSet[i].teamId === team.id)
                return lastSet[i].point;
        }
        return 0;
    };

    return (
        <div className="flex items-center justify-between">
            <h1 className="text-black text-7xl font-bold bg-white-800 p-4 mr-4 rounded-lg shadow-md">{calculatePoints(match.teamB)}</h1>
            <h1 className="text-black text-7xl font-bold bg-white-800 p-4 ml-4 rounded-lg shadow-md">{calculatePoints(match.teamA)}</h1>
        </div>
    );

};

export default Result;
