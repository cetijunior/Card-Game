const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = 3001; // Adjust the port as needed
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // For testing, allow all. In production, restrict this.
    }
});

// In-memory store of rooms: roomId -> { players: [socketId], gameState: {} }
let rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (roomId, callback) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], gameState: null };
        }
        const room = rooms[roomId];

        if (room.players.length < 2) {
            room.players.push(socket.id);
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);
            callback({ status: 'ok', playerCount: room.players.length });

            if (room.players.length === 2) {
                // Initiate a new game once 2 players are present
                const initialState = createInitialGameState();
                room.gameState = initialState;
                io.to(roomId).emit('gameStateUpdate', initialState);
            }

        } else {
            callback({ status: 'full' });
        }
    });

    socket.on('action', (roomId, action) => {
        const room = rooms[roomId];
        if (room && room.gameState) {
            const updatedState = handleAction(room.gameState, action);
            room.gameState = updatedState;
            io.to(roomId).emit('gameStateUpdate', updatedState);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        for (const [rid, room] of Object.entries(rooms)) {
            if (room.players.includes(socket.id)) {
                // Remove player
                room.players = room.players.filter(p => p !== socket.id);
                // If no players remain, clear the room
                if (room.players.length === 0) {
                    delete rooms[rid];
                } else {
                    // If one player left, you may reset the game or wait for another to join
                    // For simplicity, we just clear the gameState
                    room.gameState = null;
                    io.to(rid).emit('gameStateUpdate', { message: "The other player left. Waiting for new player..." });
                }
            }
        }
    });
});

// ---------------------------------------------
// Helper Functions and Game Logic
// ---------------------------------------------

// A simplified deck, dealing, and scoring logic:
const SUITS = ["♥️", "♦️", "♣️", "♠️"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function createInitialGameState() {
    const { deck, playerHands, dealerHand, communityCards } = dealInitialCards();
    return {
        phase: 'preflop',
        deck,
        playerHands,
        dealerHand,
        communityCards,
        message: '',
        roundOver: false
    };
}

function dealInitialCards() {
    let deck = initializeDeck();
    deck = shuffleDeck(deck);
    const playerHand1 = [deck[0], deck[1]];
    const playerHand2 = [deck[2], deck[3]];
    const dealerHand = [deck[4], deck[5]];
    // Community cards will be revealed as the game progresses
    return {
        deck: deck.slice(6),
        playerHands: [playerHand1, playerHand2],
        dealerHand,
        communityCards: []
    };
}

function handleAction(state, action) {
    // action = { type: 'fold' | 'call' | 'raise' | 'playAgain' }
    // This is highly simplified and does not handle full Texas Hold'em logic.

    if (action.type === 'fold') {
        state.message = 'A player folded. Dealer wins!';
        state.roundOver = true;
        return state;
    }

    if (action.type === 'call' || action.type === 'raise') {
        // Move the game forward through phases for simplicity
        if (state.phase === 'preflop') {
            // reveal flop
            state.communityCards = state.deck.slice(0, 3);
            state.deck = state.deck.slice(3);
            state.phase = 'flop';
            state.message = 'Flop revealed';
        } else if (state.phase === 'flop') {
            // turn
            state.communityCards.push(state.deck[0]);
            state.deck = state.deck.slice(1);
            state.phase = 'turn';
            state.message = 'Turn card revealed';
        } else if (state.phase === 'turn') {
            // river
            state.communityCards.push(state.deck[0]);
            state.deck = state.deck.slice(1);
            state.phase = 'river';
            state.message = 'River card revealed';
        } else if (state.phase === 'river') {
            // showdown
            return showdown(state);
        }
        return state;
    }

    if (action.type === 'playAgain') {
        return createInitialGameState();
    }

    return state;
}

function showdown(state) {
    // Compare hands and determine a winner. For simplicity, random winner:
    const player1Score = evaluateSimpleHand([...state.playerHands[0], ...state.communityCards]);
    const player2Score = evaluateSimpleHand([...state.playerHands[1], ...state.communityCards]);
    const dealerScore = evaluateSimpleHand([...state.dealerHand, ...state.communityCards]);

    let msg = `Player1: ${player1Score}, Player2: ${player2Score}, Dealer: ${dealerScore}\n`;
    // Very simplified logic: highest score wins
    const highest = Math.max(player1Score, player2Score, dealerScore);
    let winners = [];
    if (player1Score === highest) winners.push("Player 1");
    if (player2Score === highest) winners.push("Player 2");
    if (dealerScore === highest) winners.push("Dealer");

    if (winners.length > 1) {
        msg += "It's a tie between: " + winners.join(' and ');
    } else {
        msg += winners[0] + " wins!";
    }

    state.message = msg;
    state.roundOver = true;
    return state;
}

function initializeDeck() {
    const deck = [];
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            deck.push({ rank, suit, display: `${rank}${suit}` });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function evaluateSimpleHand(cards) {
    // Just sum the ranks as numbers. Not real poker logic.
    let score = 0;
    for (let card of cards) {
        score += rankToValue(card.rank);
    }
    return score;
}

function rankToValue(rank) {
    switch (rank) {
        case 'A': return 14;
        case 'K': return 13;
        case 'Q': return 12;
        case 'J': return 11;
        default: return parseInt(rank, 10);
    }
}

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
