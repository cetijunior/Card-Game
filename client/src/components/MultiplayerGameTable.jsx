import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Hand from './Hand';
import Scoreboard from './Scoreboard';

let socket;

export default function MultiplayerGameTable({ userName, roomId, onBack }) {
    const [gameState, setGameState] = useState(null);
    const [joined, setJoined] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [winAnimation, setWinAnimation] = useState(false);
    const [loseAnimation, setLoseAnimation] = useState(false);

    useEffect(() => {
        socket = io("http://localhost:3001"); // Change to your server address
        socket.emit('joinRoom', roomId, (response) => {
            if (response.status === 'ok') {
                if (response.playerCount < 2) {
                    setWaiting(true);
                }
                setJoined(true);
            } else {
                alert('Room is full or cannot join.');
                onBack();
            }
        });

        socket.on('gameStateUpdate', (state) => {
            setGameState(state);
            setWaiting(false);
            // handle animations if necessary based on messages in state
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId, onBack]);

    if (!joined) {
        return <div className="text-white">Joining room...</div>;
    }

    if (waiting) {
        return (
            <div className="text-white flex flex-col items-center">
                <h2 className="text-3xl font-bold text-yellow-400">Waiting for another player...</h2>
                <p className="text-gray-300 mt-2">Room: {roomId}</p>
                <button
                    onClick={onBack}
                    className="mt-4 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (!gameState) {
        return <div className="text-white">Loading game state...</div>;
    }

    function sendAction(type) {
        socket.emit('action', roomId, { type });
    }

    const { dealerHand, communityCards, playerHands, message, roundOver } = gameState;
    // For simplicity, assume playerHands[0] is this player, playerHands[1] is opponent

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-black bg-pattern text-white p-5">
            {winAnimation && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="bg-green-500 opacity-50 animate-ping w-64 h-64 rounded-full"></div>
                </div>
            )}
            {loseAnimation && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="animate-shake w-full h-full"></div>
                </div>
            )}

            {/* Top Bar */}
            <div className="w-full max-w-5xl flex justify-between mb-4">
                <Scoreboard />
                <div className="text-white text-xl font-semibold">{userName}</div>
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500"
                    onClick={onBack}
                >
                    Exit
                </button>
            </div>

            <h1 className="text-4xl font-bold text-yellow-400 mb-5 text-center">
                🃏 Texas Hold'em Multiplayer 🃏
            </h1>

            {/* Poker Table */}
            <div className="relative w-full max-w-5xl flex flex-col items-center rounded-full p-10 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border-8 border-gray-700">

                {/* Dealer Hand (or could be a "board" role in multiplayer) */}
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

                {/* Player Hand */}
                <div className="mt-6">
                    <h2 className="text-2xl mb-2 text-center">{userName}'s Hand</h2>
                    <Hand cards={playerHands[0]} hidden={false} />
                </div>
            </div>

            {message && (
                <div className="bg-black bg-opacity-70 rounded p-4 text-center mt-4 whitespace-pre-line max-w-md">
                    {message}
                </div>
            )}

            {roundOver && (
                <button
                    onClick={() => sendAction('playAgain')}
                    className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-400 z-20"
                >
                    Play Again
                </button>
            )}
        </div>
    );
}
