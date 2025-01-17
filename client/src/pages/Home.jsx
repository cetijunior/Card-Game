import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ userName }) {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
			<h1 className="text-4xl font-bold text-yellow-400 mb-5">Welcome, {userName}</h1>
			<div className="flex space-x-4">
				<button
					onClick={() => navigate("/singleplayer")}
					className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
				>
					Singleplayer
				</button>
				<button
					onClick={() => navigate("/multiplayer")}
					className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
				>
					Multiplayer
				</button>
			</div>
		</div>
	);
}
