import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUserName as saveUserName } from "../logic/storage";

export default function UsernameInput({ setUserName }) {
	const [username, setUsername] = useState("");
	const navigate = useNavigate();

	const handleStart = () => {
		if (username.trim()) {
			setUserName(username.trim());
			saveUserName(username.trim());
			navigate("/home");
		} else {
			alert("Please enter a username.");
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
			<h1 className="text-4xl font-bold text-yellow-400 mb-5">🃏 Card Game 🃏</h1>
			<div className="flex flex-col items-center">
				<label className="text-lg mb-2">Enter Your Username</label>
				<input
					type="text"
					className="px-4 py-2 rounded text-black mb-4"
					placeholder="Your Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button
					onClick={handleStart}
					className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
				>
					Start Game
				</button>
			</div>
		</div>
	);
}
