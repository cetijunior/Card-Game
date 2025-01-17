import React from "react";
import GameTable from "../components/GameTable";
import { useNavigate } from "react-router-dom";


export default function SinglePlayer({ userName }) {
	const navigate = useNavigate();
	return (
		<div>
			<GameTable userName={userName} onShowMultiplayer={() => navigate('/multiplayer')} />
		</div>
	);
}
