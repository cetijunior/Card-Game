import React, { useState, useEffect } from 'react';
import Hand from './Hand';
import Scoreboard from './Scoreboard';
import { initializeDeck, shuffleDeck, evaluateTexasHoldemHand } from '../logic/pokerLogic';
import { updateScoreData } from '../logic/storage';

export default function GameTable({ userName, onShowMultiplayer }) {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [communityCards, setCommunityCards] = useState([]);
    const [phase, setPhase] = useState('preflop');
    const [message, setMessage] = useState('');
    const [roundOver, setRoundOver] = useState(false);
    const [winAnimation, setWinAnimation] = useState(false);
    const [loseAnimation, setLoseAnimation] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        startGame();
        const ws = new WebSocket('ws://localhost:8080');
        setSocket(ws);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Handle incoming messages
        };

        return () => {
            ws.close();
        };
    }, []);

    function startGame() {
        const newDeck = shuffleDeck(initializeDeck());
        setDeck(newDeck);
        setPlayerHand([newDeck[0], newDeck[1]]);
        setDealerHand([newDeck[2], newDeck[3]]);
        setCommunityCards([]);
        setPhase('preflop');
        setMessage('');
        setRoundOver(false);
        setWinAnimation(false);
        setLoseAnimation(false);
    }

    function nextPhase() {
        if (phase === 'preflop') {
            setCommunityCards(deck.slice(4, 7));
            setPhase('flop');
        } else if (phase === 'flop') {
            setCommunityCards(prev => [...prev, deck[7]]);
            setPhase('turn');
        } else if (phase === 'turn') {
            setCommunityCards(prev => [...prev, deck[8]]);
            setPhase('river');
        } else if (phase === 'river') {
            showdown();
        }
    }

    function fold() {
        setMessage('You folded. Dealer wins!');
        sendMessage({ type: 'fold' });
        updateScoreData(false);
    }

    function call() {
        if (phase !== 'river') {
            nextPhase();
        } else {
            showdown();
        }
    }

    function raise() {
        if (phase !== 'river') {
            nextPhase();
        } else {
            showdown();
        }
    }

    function showdown() {
        const playerScore = evaluateTexasHoldemHand(playerHand, communityCards);
        const dealerScore = evaluateTexasHoldemHand(dealerHand, communityCards);

        let msg = `Your Score: ${playerScore}\nDealer's Score: ${dealerScore}\n`;
        if (playerScore > dealerScore) {
            msg += 'You win!';
            setWinAnimation(true);
            updateScoreData(true);
        } else if (playerScore < dealerScore) {
            msg += 'Dealer wins!';
            setLoseAnimation(true);
            updateScoreData(false);
        } else {
            msg += "It's a tie!";
            updateScoreData(false);
        }

        setMessage(msg);
        setRoundOver(true);
        setPhase('showdown');
    }

    function sendMessage(message) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-green-900 text-white p-5">
            {/* Overlay animations that don't block interaction */}
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
                    className="bg-yellow-400 text-green-900 px-4 py-2 rounded hover:bg-yellow-300"
                    onClick={() => onShowMultiplayer()}
                >
                    Multiplayer
                </button>
            </div>

            <h1 className="text-4xl font-bold text-yellow-400 mb-5 text-center">
                🎰 Texas Hold'em Poker 🎰
            </h1>

            {/* Poker Table */}
            <div className="relative w-full max-w-5xl flex flex-col items-center rounded-full p-10 bg-gradient-to-br from-green-800 to-green-700 shadow-2xl border-8 border-green-900">

                {/* Dealer Hand at the top */}
                <div className="mb-6">
                    <h2 className="text-2xl mb-2 text-center">Dealer's Hand</h2>
                    <Hand cards={dealerHand} hidden={phase !== 'showdown'} />
                </div>

                {/* Community Cards in the center */}
                <div className="mb-6">
                    <h2 className="text-2xl mb-2 text-center">Community Cards</h2>
                    <Hand cards={communityCards} hidden={false} />
                </div>

                {/* Controls */}
                <div className="flex space-x-4 my-4">
                    <button
                        onClick={fold}
                        disabled={roundOver}
                        className={`${roundOver ? 'bg-gray-400' : 'bg-yellow-400 hover:bg-yellow-300'} px-4 py-2 rounded font-bold text-green-900`}
                    >
                        Fold
                    </button>
                    <button
                        onClick={call}
                        disabled={roundOver}
                        className={`${roundOver ? 'bg-gray-400' : 'bg-yellow-400 hover:bg-yellow-300'} px-4 py-2 rounded font-bold text-green-900`}
                    >
                        Call
                    </button>
                    <button
                        onClick={raise}
                        disabled={roundOver}
                        className={`${roundOver ? 'bg-gray-400' : 'bg-yellow-400 hover:bg-yellow-300'} px-4 py-2 rounded font-bold text-green-900`}
                    >
                        Raise
                    </button>
                </div>

                {/* Player Hand at the bottom */}
                <div className="mt-6">
                    <h2 className="text-2xl mb-2 text-center">Your Hand</h2>
                    <Hand cards={playerHand} hidden={false} />
                </div>
            </div>

            {message && (
                <div className="bg-black bg-opacity-70 rounded p-4 text-center mt-4 whitespace-pre-line max-w-md">
                    {message}
                </div>
            )}

            {roundOver && (
                <button
                    onClick={startGame}
                    className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-400 z-20"
                >
                    Play Again
                </button>
            )}
        </div>
    );
}
