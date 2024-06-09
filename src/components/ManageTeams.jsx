import React, { useState } from 'react';

const ManageTeams = ({ teams, websocket }) => {
    const [teamName, setTeamName] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    const handleAddTeam = (event) => {
        event.preventDefault();
        if (!websocket) {
            return;
        }

        const team = {
            name: teamName,
            players: JSON.stringify({ players: players })
        };

        websocket.publish({
            destination: '/app/addTeam',
            body: JSON.stringify(team),
        });

        setTeamName('');
        setPlayers([]);
    };

    const handleEditTeam = (team) => {
        setSelectedTeam(team);
        setTeamName(team.name);
        let parsedPlayers = [];
        try {
            const playersObj = JSON.parse(team.players);
            if (Array.isArray(playersObj.players)) {
                parsedPlayers = playersObj.players;
            }
        } catch (error) {
            console.error('Failed to parse players:', error);
        }

        setPlayers(parsedPlayers);
    };

    const handleUpdateTeam = (event) => {
        event.preventDefault();
        if (!websocket) {
            console.log('WebSocket is not connected');
            return;
        }

        const updatedTeam = {
            ...selectedTeam,
            name: teamName,
            players: JSON.stringify({ players: players })
        };

        websocket.publish({
            destination: '/app/updateTeam',
            body: JSON.stringify(updatedTeam),
        });

        setSelectedTeam(null);
        setTeamName('');
        setPlayers([]);
    };

    const openDeleteModal = (teamId) => {
        setTeamToDelete(teamId);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setTeamToDelete(null);
    };

    const confirmDeleteTeam = () => {
        if (!websocket || !teamToDelete) {
            console.log('WebSocket is not connected or no team selected for deletion');
            return;
        }

        websocket.publish({
            destination: '/app/deleteTeam',
            body: JSON.stringify({ id: teamToDelete }),
        });

        closeDeleteModal();
    };

    const handleAddPlayer = () => {
        setPlayers([...players, playerName]);
        setPlayerName('');
    };

    const handleRemovePlayer = (index) => {
        const newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
    };

    return (
        <div className="container mx-auto max-w-sm p-4">
            <h1 className="text-2xl font-bold text-center mb-4">Manage Teams</h1>

            <form onSubmit={selectedTeam ? handleUpdateTeam : handleAddTeam}>
                <div className="mb-4">
                    <label htmlFor="teamName" className="block text-gray-700">Team Name</label>
                    <input
                        type="text"
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="playerName" className="block text-gray-700">Player Name</label>
                    <div className="flex">
                        <input
                            type="text"
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddPlayer}
                            className="ml-2 py-2 px-4 rounded-md bg-blue-500 text-white font-bold hover:bg-blue-600">
                            Add Player
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Players</label>
                    <ul className="list-disc list-inside">
                        {players.map((player, index) => (
                            <li key={index} className="flex justify-between">
                                {player}
                                <button
                                    type="button"
                                    onClick={() => handleRemovePlayer(index)}
                                    className="text-red-500 hover:text-red-700">
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-md bg-blue-500 text-white font-bold hover:bg-blue-600">
                    {selectedTeam ? 'Update Team' : 'Add Team'}
                </button>
            </form>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Existing Teams</h2>
                <ul className="list-disc list-inside">
                    {teams.map(team => (
                        <li key={team.id} className="flex justify-between items-center mb-2">
                            <span>{team.name}</span>
                            <div>
                                <button
                                    onClick={() => handleEditTeam(team)}
                                    className="text-blue-500 hover:text-blue-700 mr-2">
                                    Edit
                                </button>
                                <button
                                    onClick={() => openDeleteModal(team.id)}
                                    className="text-red-500 hover:text-red-700">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p>Are you sure you want to delete this team?</p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={closeDeleteModal}
                                className="py-2 px-4 mr-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400">
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteTeam}
                                className="py-2 px-4 rounded-md bg-red-500 text-white font-bold hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTeams;
