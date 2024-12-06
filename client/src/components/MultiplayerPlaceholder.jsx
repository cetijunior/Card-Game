import React from 'react';

export default function MultiplayerPlaceholder({ onBack }) {
    return (
        <div className="flex flex-col items-center bg-green-900 text-white min-h-screen p-5">
            <h1 className="text-4xl font-bold text-yellow-400 mb-5">Multiplayer Mode</h1>
            <p className="text-xl mb-5">Coming Soon!</p>
            <button className="bg-green-500 px-4 py-2 rounded" onClick={onBack}>Back to Game</button>
        </div>
    );
}
