import React, { useState } from 'react';
import UserForm from './components/UserForm';
import GameTable from './components/GameTable';
import MultiplayerSetup from './components/MultiplayerSetup';
import MultiplayerGameTable from './components/MultiplayerGameTable';
import { getUserName } from './logic/storage';

export default function App() {
  const [userName, setUserName] = useState(getUserName());
  const [mode, setMode] = useState('menu'); // 'menu', 'single', 'multiSetup', 'multi'
  const [roomId, setRoomId] = useState('');

  if (!userName) {
    return <UserForm onUserSet={setUserName} />;
  }

  if (mode === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-pattern text-white p-5">
        <h1 className="text-4xl font-bold text-yellow-400 mb-5">Welcome, {userName}</h1>
        <div className="space-y-4">
          <button
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
            onClick={() => setMode('single')}
          >
            Singleplayer
          </button>
          <button
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
            onClick={() => setMode('multiSetup')}
          >
            Multiplayer
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'single') {
    return (
      <GameTable
        userName={userName}
        onShowMultiplayer={() => setMode('multiSetup')}
      />
    );
  }

  if (mode === 'multiSetup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-pattern text-white p-5">
        <MultiplayerSetup onJoin={(rid) => { setRoomId(rid); setMode('multi'); }} />
        <button onClick={() => setMode('menu')} className="mt-4 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">
          Back
        </button>
      </div>
    );
  }

  if (mode === 'multi') {
    return (
      <MultiplayerGameTable
        userName={userName}
        roomId={roomId}
        onBack={() => setMode('menu')}
      />
    );
  }

  return null;
}
