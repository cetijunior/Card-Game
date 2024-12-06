// Storage utility: handle user and score data in localStorage

export function getUserName() {
    return localStorage.getItem('poker_username') || '';
}

export function setUserName(name) {
    localStorage.setItem('poker_username', name);
}

export function getScoreData() {
    const data = localStorage.getItem('poker_scores');
    return data ? JSON.parse(data) : { games: 0, wins: 0, losses: 0 };
}

export function updateScoreData(isWin) {
    const data = getScoreData();
    data.games += 1;
    if (isWin) {
        data.wins += 1;
    } else {
        data.losses += 1;
    }
    localStorage.setItem('poker_scores', JSON.stringify(data));
}
