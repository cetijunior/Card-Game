import React from 'react';
import { getScoreData } from '../logic/storage';

export default function Scoreboard() {
    const { games, wins, losses } = getScoreData();
    const winRate = games > 0 ? ((wins / games) * 100).toFixed(2) : 0;

    return (
        <div className="text-white bg-black bg-opacity-50 rounded p-2 text-center">
            <div></div>
            <div>Games: {games}</div>
            <div>Wins: {wins}</div>
            <div>Losses: {losses}</div>
            <div>Win Rate: {winRate}%</div>
        </div>
    );
}
