import React, { useState } from 'react';

export default function MultiplayerSetup({ onJoin }) {
    const [roomId, setRoomId] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (roomId.trim()) {
            onJoin(roomId.trim());
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4 text-white">
            <h2 className="text-2xl font-bold">Multiplayer Setup</h2>
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    className="px-4 py-2 rounded text-black"
                    placeholder="Enter room code"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500"
                    type="submit"
                >
                    Join Room
                </button>
            </form>
            <p className="text-sm text-gray-300">Share this room code with another player on your network.</p>
        </div>
    );
}
