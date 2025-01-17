import React, { useState } from "react";
import { setUserName } from "../logic/storage";
import { useNavigate } from "react-router-dom";

export default function UserForm({ onUserSet }) {
	const [name, setName] = useState("");

	const navigate = useNavigate();

	function handleSubmit(e) {
		e.preventDefault();
		if (name.trim() !== "") {
			setUserName(name.trim());
			onUserSet(name.trim());
		}
	}

	const handleStart = () => {
		if (username.trim()) {
			setUserName(username.trim());
			navigate("/multiplayer");
		} else {
			// Display an error message or handle the case when the username is empty
			console.log("Username is mandatory");
		}
	};

	return (
		<div className="flex flex-col items-center bg-green-900 text-white min-h-screen p-5">
			<h1 className="text-3xl font-bold mb-5 text-yellow-400">
				Welcome to Texas Hold'em
			</h1>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col items-center space-y-4"
			>
				<input
					className="px-4 py-2 rounded text-black"
					type="text"
					placeholder="Enter your name..."
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<div className="flex space-x-4">
					<button
						onClick={() => navigate("/singleplayer")}
						className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
					>
						Singleplayer
					</button>
					<button
						onClick={handleStart}
						className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 font-bold"
					>
						Multiplayer
					</button>
				</div>
			</form>
		</div>
	);
}
