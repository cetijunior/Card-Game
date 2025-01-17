import React, { useState } from "react";
import MultiplayerSetup from "../components/MultiplayerSetup";
import MultiplayerGameTable from "../components/MultiplayerGameTable";
import { useNavigate } from "react-router-dom";

export default function Multiplayer({ userName }) {
	const [roomId, setRoomId] = useState("");
	const [inGame, setInGame] = useState(false);

	const navigate = useNavigate();

	if (!inGame) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
				<MultiplayerSetup
					onJoin={(room) => {
						setRoomId(room);
						setInGame(true);
					}}
				/>
				<button
					className="mt-6 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
					onClick={() => navigate("/home")}
				>
					Back to Home
				</button>
			</div>
		);
	}

	return (
		<MultiplayerGameTable
			userName={userName}
			roomId={roomId}
			onBackToMenu={() => setInGame(false)}
			onStartSingleplayer={() => navigate("/singleplayer")}
		/>
	);
}
