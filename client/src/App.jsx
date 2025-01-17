import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UsernameInput from "./pages/UsernameInput";
import Home from "./pages/Home";
import SinglePlayer from "./pages/SinglePlayer";
import Multiplayer from "./pages/Multiplayer";

export default function App() {
	const [userName, setUserName] = useState("");

	return (
		<Router>
			<Routes>
				<Route path="/" element={<UsernameInput setUserName={setUserName} />} />
				<Route path="/home" element={<Home userName={userName} />} />
				<Route path="/singleplayer" element={<SinglePlayer userName={userName} />} />
				<Route path="/multiplayer" element={<Multiplayer userName={userName} />} />
			</Routes>
		</Router>
	);
}
