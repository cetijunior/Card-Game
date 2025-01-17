import React, { useState, useEffect } from "react";
import Hand from "./Hand";
import Scoreboard from "./Scoreboard";
import {
	initializeDeck,
	shuffleDeck,
	evaluateTexasHoldemHand,
} from "../logic/pokerLogic";
import { updateScoreData } from "../logic/storage";

export default function GameTable({ userName, onShowMultiplayer }) {
	const [deck, setDeck] = useState([]);
	const [playerHand, setPlayerHand] = useState([]);
	const [dealerHand, setDealerHand] = useState([]);
	const [communityCards, setCommunityCards] = useState([]);
	const [phase, setPhase] = useState("preflop");
	const [message, setMessage] = useState("");
	const [roundOver, setRoundOver] = useState(false);
	const [winAnimation, setWinAnimation] = useState(false);
	const [loseAnimation, setLoseAnimation] = useState(false);

	useEffect(() => {
		startGame();
	}, []);

	function startGame() {
		const newDeck = shuffleDeck(initializeDeck());
		setDeck(newDeck);
		setPlayerHand([newDeck[0], newDeck[1]]);
		setDealerHand([newDeck[2], newDeck[3]]);
		setCommunityCards([]);
		setPhase("preflop");
		setMessage("");
		setRoundOver(false);
		setWinAnimation(false);
		setLoseAnimation(false);
	}

	function nextPhase() {
		if (phase === "preflop") {
			setCommunityCards(deck.slice(4, 7));
			setPhase("flop");
		} else if (phase === "flop") {
			setCommunityCards((prev) => [...prev, deck[7]]);
			setPhase("turn");
		} else if (phase === "turn") {
			setCommunityCards((prev) => [...prev, deck[8]]);
			setPhase("river");
		} else if (phase === "river") {
			showdown();
		}
	}

	function fold() {
		setMessage("You folded. Dealer wins!");
		setRoundOver(true);
		updateScoreData(false);
		setLoseAnimation(true);
	}

	function call() {
		if (phase !== "river") {
			nextPhase();
		} else {
			showdown();
		}
	}

	function raise() {
		if (phase !== "river") {
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
			msg += "You win!";
			setWinAnimation(true);
			updateScoreData(true);
		} else if (playerScore < dealerScore) {
			msg += "Dealer wins!";
			setLoseAnimation(true);
			updateScoreData(false);
		} else {
			msg += "It's a tie!";
			updateScoreData(false);
		}

		setMessage(msg);
		setRoundOver(true);
		setPhase("showdown");
	}

	return (
		<div className="relative flex flex-col items-center min-h-screen bg-green-900 text-white p-4">
			{/* Win or Lose Animation */}
			{winAnimation && (
				<div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
					<div className="bg-green-500 opacity-50 animate-ping w-64 h-64 rounded-full"></div>
				</div>
			)}
			{loseAnimation && (
				<div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
					<div className="bg-red-500 opacity-50 animate-ping w-64 h-64 rounded-full"></div>
				</div>
			)}

			{/* Top Bar */}
			<div className="w-full max-w-5xl flex flex-wrap justify-between items-center mb-4 px-4">
				<Scoreboard />
				<div className="text-center font-semibold text-xl">{userName}</div>
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
			<div className="relative w-full max-w-5xl flex flex-col items-center p-6 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 shadow-lg space-y-6">
				{/* Dealer's Hand */}
				<div>
					<h2 className="text-lg font-bold text-center mb-2">Dealer's Hand</h2>
					<Hand cards={dealerHand} hidden={phase !== "showdown"} />
				</div>

				{/* Community Cards */}
				<div>
					<h2 className="text-lg font-bold text-center mb-2">
						Community Cards
					</h2>
					<Hand cards={communityCards} hidden={false} />
				</div>

				{/* Player's Hand */}
				<div>
					<h2 className="text-lg font-bold text-center mb-2">Your Hand</h2>
					<Hand cards={playerHand} hidden={false} />
				</div>
			</div>

			{message && (
				<div className="bg-gray-900 text-white rounded p-4 text-center mt-4">
					{message}
				</div>
			)}

			{/* Controls */}
			<div className="mt-6 flex flex-wrap gap-4 justify-center">
				<button
					className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded font-bold"
					onClick={call}
					disabled={roundOver}
				>
					Call
				</button>
				<button
					className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded font-bold"
					onClick={fold}
					disabled={roundOver}
				>
					Fold
				</button>
				<button
					className="bg-yellow-400 hover:bg-yellow-300 text-green-900 px-4 py-2 rounded font-bold"
					onClick={raise}
					disabled={roundOver}
				>
					Raise
				</button>
			</div>

			{roundOver && (
				<button
					onClick={startGame}
					className="mt-6 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded font-bold"
				>
					Play Again
				</button>
			)}
		</div>
	);
}
