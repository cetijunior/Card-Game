import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Hand from './Hand';
import Scoreboard from './Scoreboard';

let socket;

const CANNED_MESSAGES = [
    "Good luck!",
    "Nice hand!",
    "Well played!",
    "GG!",
    "What a flop!"
];

export default function MultiplayerGameTable({ userName, roomId, onBackToMenu, onStartSingleplayer }) {
    const [gameState, setGameState] = useState(null);
    const [joined, setJoined] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [joinError, setJoinError] = useState(null);

    const [selectedMessage, setSelectedMessage] = useState('');
    const [playerIndex, setPlayerIndex] = useState(null);

    useEffect(() => {
        socket = io("http://localhost:3001");
        socket.emit('joinRoom', roomId, (response) => {
            if (response.status === 'ok') {
                if (response.playerCount < 2) {
                    setWaiting(true);
                }
                setJoined(true);
            } else if (response.status === 'full') {
                setJoinError("Room is full or cannot join.");
            } else {
                setJoinError("Unknown error joining the room.");
            }
        });

        socket.on('gameStateUpdate', (state) => {
            if (!state) return;

            if (state.sessionTerminated) {
                setGameState(state);
                setWaiting(false);
                return;
            }

            setGameState(state);
            setWaiting(false);

            if (state.playerMapping && playerIndex === null && socket && socket.id) {
                const myIndex = state.playerMapping[socket.id];
                setPlayerIndex(myIndex);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId, playerIndex]);

    function sendAction(type) {
        socket.emit('action', roomId, { type });
    }

    function sendCannedMessage(e) {
        e.preventDefault();
        if (selectedMessage) {
            socket.emit('chatMessage', roomId, `[${userName}]: ${selectedMessage}`);
            setSelectedMessage('');
        }
    }

    // Handling states
    if (joinError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-pattern text-white p-5">
                <h2 className="text-2xl font-bold mb-4">{joinError}</h2>
                <div className="space-x-2">
                    <button
                        onClick={onBackToMenu}
                        className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Back to Menu
                    </button>
                    <button
                        onClick={onStartSingleplayer}
                        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500"
                    >
                        Singleplayer
                    </button>
                </div>
            </div>
        );
    }

    if (!joined) {
        return <div className="text-white flex flex-col items-center justify-center min-h-screen bg-black bg-pattern">Joining room...</div>;
    }

    if (waiting) {
        return (
            <div className="text-white flex flex-col items-center justify-center min-h-screen bg-black bg-pattern">
                <h2 className="text-3xl font-bold text-yellow-400">Waiting for another player...</h2>
                <p className="text-gray-300 mt-2">Room: {roomId}</p>
                <button
                    onClick={onBackToMenu}
                    className="mt-4 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (!gameState) {
        return <div className="text-white flex flex-col items-center justify-center min-h-screen bg-black bg-pattern">Loading game state...</div>;
    }

    const { dealerHand, communityCards, playerHands, message, roundOver, sessionTerminated, messages = [] } = gameState;

    if (sessionTerminated) {
        return (
            <div className="text-white flex flex-col items-center justify-center min-h-screen bg-black bg-pattern p-5">
                <h2 className="text-2xl font-bold mb-4">This game session is no longer active.</h2>
                {message && <p className="mb-4">{message}</p>}
                <div className="space-x-2">
                    <button
                        onClick={onBackToMenu}
                        className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Back to Menu
                    </button>
                    <button
                        onClick={onStartSingleplayer}
                        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500"
                    >
                        Singleplayer
                    </button>
                </div>
            </div>
        );
    }

    const myHand = (playerIndex !== null && playerHands && playerHands[playerIndex]) ? playerHands[playerIndex] : [];

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-black bg-pattern text-white p-5">
            {/* Top Bar */}
            <div className="w-full max-w-5xl flex justify-between mb-4">
                <Scoreboard />
                <div className="text-white text-xl font-semibold">{userName}</div>
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500"
                    onClick={onBackToMenu}
                >
                    Exit
                </button>
            </div>

            <h1 className="text-4xl font-bold text-yellow-400 mb-5 text-center">
                🃏 Texas Hold'em Multiplayer 🃏
            </h1>

            <div className="relative w-full max-w-5xl flex flex-col items-center rounded-full p-10 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border-8 border-gray-700">
                {/* Dealer Hand */}
                <div className="mb-6">
                    <h2 className="text-2xl mb-2 text-center">Dealer's Hand</h2>
                    <Hand cards={dealerHand} hidden={true} />
                </div>

                {/* Community Cards */}
                <div className="mb-6">
                    <h2 className="text-2xl mb-2 text-center">Community Cards</h2>
                    <Hand cards={communityCards} hidden={false} />
                </div>

                {/* Controls */}
                <div className="flex space-x-4 my-4">
                    <button
                        onClick={() => sendAction('fold')}
                        disabled={roundOver}
                        className={`${roundOver ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-500'} px-4 py-2 rounded font-bold`}
                    >
                        Fold
                    </button>
                    <button
                        onClick={() => sendAction('call')}
                        disabled={roundOver}
                        className={`${roundOver ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-500'} px-4 py-2 rounded font-bold`}
                    >
                        Call
                    </button>
                    <button
                        onClick={() => sendAction('raise')}
                        disabled={roundOver}
                        className={`${roundOver ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-500'} px-4 py-2 rounded font-bold`}
                    >
                        Raise
                    </button>
                </div>

                {/* Player's Hand */}
                <div className="mt-6">
                    <h2 className="text-2xl mb-2 text-center">{userName}'s Hand</h2>
                    <Hand cards={myHand} hidden={false} />
                </div>
            </div>

            {message && (
                <div className="bg-black bg-opacity-70 rounded p-4 text-center mt-4 whitespace-pre-line max-w-md">
                    {message}
                </div>
            )}

            {roundOver && !sessionTerminated && (
                <button
                    onClick={() => sendAction('playAgain')}
                    className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-400 z-20"
                >
                    Play Again
                </button>
            )}

            {/* Chat Window (Canned Messages Only) */}
            <div className="w-full max-w-5xl mt-8 flex flex-col">
                <div className="bg-gray-800 bg-opacity-50 rounded p-4 h-48 overflow-auto mb-2">
                    <h3 className="font-bold mb-2">Chat</h3>
                    {messages.length === 0 && <div className="text-gray-400 text-sm">No messages yet</div>}
                    {messages.map((m, i) => (
                        <div key={i} className="mb-1 text-sm break-words">
                            {m.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={sendCannedMessage} className="flex space-x-2 items-center">
                    <select
                        className="px-3 py-2 rounded text-black"
                        value={selectedMessage}
                        onChange={(e) => setSelectedMessage(e.target.value)}
                        disabled={sessionTerminated}
                    >
                        <option value="">Select a message</option>
                        {CANNED_MESSAGES.map((msg, idx) => (
                            <option key={idx} value={msg}>{msg}</option>
                        ))}
                    </select>
                    <button
                        className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-500 font-bold"
                        type="submit"
                        disabled={sessionTerminated || !selectedMessage}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
