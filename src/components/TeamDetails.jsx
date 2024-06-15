import React from 'react';

const TeamDetails = ({ team, bgColor }) => {
    if (!team) {
        return null;
    }

    return (
            <div className={`p-6 m-4 rounded-lg shadow-md ${bgColor}`}>
                <p className="font-bold text-4xl mb-5">{team.name}</p>
                <ul className="list-disc list-inside">
                    {team.players.map((player, index) => (
                        <li key={index} className="ml-4">{player}</li>
                    ))}
                </ul>
            </div>
    );
};

export default TeamDetails;
