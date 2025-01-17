import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Hand from "./Hand";

let socket;

const CANNED_MESSAGES = [
	"Good luck!",
	"Nice hand!",
	"Well played!",
	"GG!",
	"What a flop!",
];

export default function MultiplayerGameTable({
	userName,
	roomId,
	onBackToMenu,
	onStartSingleplayer,
}) {
	const [gameState, setGameState] = useState(null);
	const [joined, setJoined] = useState(false);
	const [waiting, setWaiting] = useState(false);
	const [joinError, setJoinError] = useState(null);
	const [playerIndex, setPlayerIndex] = useState(null);
	const [playAgainVotes, setPlayAgainVotes] = useState([]);
	const [selectedMessage, setSelectedMessage] = useState("");

	const prevRoundOverRef = useRef(false);

	useEffect(() => {
		socket = io("http://localhost:3001");
		socket.emit("joinRoom", roomId, userName, (response) => {
			if (response.status === "ok") {
				if (response.playerCount < 2) {
					setWaiting(true);
				}
				setJoined(true);
			} else if (response.status === "full") {
				setJoinError("Room is full or cannot join.");
			} else {
				setJoinError("Unknown error joining the room.");
			}
		});

		socket.on("gameStateUpdate", (state) => {
			if (!state) return;

			setGameState(state);
			setPlayAgainVotes(state.playAgainVotes || []);

			if (state.playerMapping && playerIndex === null && socket && socket.id) {
				const myIndex = state.playerMapping[socket.id];
				setPlayerIndex(myIndex);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [roomId, playerIndex, userName]);

	useEffect(() => {
		if (gameState) {
			const { roundOver } = gameState;
			const prevRoundOver = prevRoundOverRef.current;
			if (roundOver && !prevRoundOver) {
				setPlayAgainVotes([]);
			}
			prevRoundOverRef.current = roundOver;
		}
	}, [gameState]);

	function sendAction(type) {
		socket.emit("action", roomId, { type });
	}

	function votePlayAgain() {
		socket.emit("votePlayAgain", roomId, userName);
	}

	function sendCannedMessage(e) {
		e.preventDefault();
		if (selectedMessage) {
			socket.emit("chatMessage", roomId, `[${userName}]: ${selectedMessage}`);
			setSelectedMessage("");
		}
	}

	if (joinError) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
				<h2 className="text-2xl font-bold mb-4">{joinError}</h2>
				<button
					className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
					onClick={onBackToMenu}
				>
					Back to Menu
				</button>
			</div>
		);
	}

	if (!joined) {
		return (
			<div className="text-white flex flex-col items-center justify-center min-h-screen bg-black">
				Joining room...
			</div>
		);
	}

	if (waiting) {
		return (
			<div className="text-white flex flex-col items-center justify-center min-h-screen bg-black">
				<h2 className="text-3xl font-bold text-yellow-400">
					Waiting for another player...
				</h2>
				<p className="text-gray-300 mt-2">Room: {roomId}</p>
				<button
					className="mt-4 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
					onClick={onBackToMenu}
				>
					Cancel
				</button>
			</div>
		);
	}

	if (!gameState) {
		return (
			<div className="text-white flex flex-col items-center justify-center min-h-screen bg-black">
				Loading game state...
			</div>
		);
	}

	const {
		dealerHand,
		communityCards,
		playerHands,
		message,
		roundOver,
		sessionTerminated,
		usernames = {},
		currentTurn,
		messages = [],
	} = gameState;

	const myHand =
		playerIndex !== null && playerHands && playerHands[playerIndex]
			? playerHands[playerIndex]
			: [];
	const opponentName = Object.values(usernames).find(
		(name, index) => index !== playerIndex
	);

	const allPlayersWantToPlayAgain =
		playAgainVotes.length === Object.keys(usernames).length;

	if (sessionTerminated) {
		return (
			<div className="text-white flex flex-col items-center justify-center min-h-screen bg-black">
				<h2 className="text-2xl font-bold mb-4">
					This game session is no longer active.
				</h2>
				<button
					onClick={onBackToMenu}
					className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
				>
					Back to Menu
				</button>
			</div>
		);
	}

	return (
		<div className="relative flex flex-col items-center min-h-screen bg-black text-white p-5">
			<div className="w-full flex justify-between mb-4">
				<div>
					<h2 className="text-lg font-semibold">Current Turn:</h2>
					<p className="text-yellow-400">
						{gameState.currentTurn !== null && usernames
							? usernames[Object.keys(usernames)[gameState.currentTurn]]
							: "Waiting..."}
					</p>

				</div>
				<button
					className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
					onClick={onBackToMenu}
				>
					Exit
				</button>
			</div>

			{/* Game Table */}
			<div className="w-full max-w-5xl">
				{/* Dealer Hand */}
				<h2 className="text-xl mb-2">Dealer's Hand</h2>
				<Hand cards={dealerHand} hidden />

				{/* Community Cards */}
				<h2 className="text-xl mt-4">Community Cards</h2>
				<Hand cards={communityCards} />

				{/* Player's Hand */}
				<h2 className="text-xl mt-4">{userName}'s Hand</h2>
				<Hand cards={myHand} />
			</div>

			{/* Round Outcome */}
			{message && (
				<div className="bg-gray-800 p-4 mt-4 rounded text-center">
					{message}
				</div>
			)}

			{/* Controls */}
			{roundOver ? (
				<div className="mt-4">
					<button
						onClick={votePlayAgain}
						className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
						disabled={playAgainVotes.includes(userName)}
					>
						Play Again
					</button>
					<p className="text-sm mt-2">
						{playAgainVotes.length}/{Object.keys(usernames).length} players want to play again.
					</p>
					{playAgainVotes.length > 0 && (
						<p className="text-sm mt-1">
							Players ready: {playAgainVotes.map((vote) => usernames[vote]).join(", ")}
						</p>
					)}

				</div>
			) : (
				<div className="flex space-x-4 mt-4">
					<button
						onClick={() => sendAction("call")}
						className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
					>
						Call
					</button>
					<button
						onClick={() => sendAction("raise")}
						className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400"
					>
						Raise
					</button>
					<button
						onClick={() => sendAction("fold")}
						className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
					>
						Fold
					</button>
				</div>
			)}

			{/* Chat Window */}
			<div className="w-full max-w-5xl mt-8 flex flex-col">
				<div className="bg-gray-800 bg-opacity-50 rounded p-4 h-48 overflow-auto mb-2">
					<h3 className="font-bold mb-2">Chat</h3>
					{messages.length === 0 && (
						<div className="text-gray-400 text-sm">No messages yet</div>
					)}
					{messages.map((m, i) => (
						<div key={i} className="mb-1 text-sm break-words">
							{m.text}
						</div>
					))}
				</div>
				<form
					onSubmit={sendCannedMessage}
					className="flex space-x-2 items-center"
				>
					<select
						className="px-3 py-2 rounded text-black"
						value={selectedMessage}
						onChange={(e) => setSelectedMessage(e.target.value)}
					>
						<option value="">Select a message</option>
						{CANNED_MESSAGES.map((msg, idx) => (
							<option key={idx} value={msg}>
								{msg}
							</option>
						))}
					</select>
					<button
						className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-500 font-bold"
						type="submit"
						disabled={!selectedMessage}
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
}
