import React, { useState } from 'react';
import { setUserName } from '../logic/storage';

export default function UserForm({ onUserSet }) {
    const [name, setName] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (name.trim() !== '') {
            setUserName(name.trim());
            onUserSet(name.trim());
        }
    }

    return (
        <div className="flex flex-col items-center bg-green-900 text-white min-h-screen p-5">
            <h1 className="text-3xl font-bold mb-5 text-yellow-400">Welcome to Texas Hold'em</h1>
            <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                <input
                    className="px-4 py-2 rounded text-black"
                    type="text"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400" type="submit">
                    Start Game
                </button>
            </form>
        </div>
    );
}
