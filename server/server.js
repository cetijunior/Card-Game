const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = 3001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

let rooms = {};
// rooms[roomId] = {
//   players: [socketId1, socketId2],
//   gameState: {
//     phase, deck, playerHands, dealerHand, communityCards, message, roundOver, playerMapping
//   },
//   messages: [] // array of {sender, text}
// }

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (roomId, callback) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], gameState: null, messages: [] };
        }
        const room = rooms[roomId];

        if (room.players.length < 2) {
            room.players.push(socket.id);
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);
            callback({ status: 'ok', playerCount: room.players.length });

            if (room.players.length === 2) {
                // Both players present, start game
                const initialState = createInitialGameState();
                initialState.playerMapping = {
                    [room.players[0]]: 0,
                    [room.players[1]]: 1
                };
                room.gameState = initialState;
                // On start of game, messages array is empty
                emitGameStateUpdate(roomId);
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
            emitGameStateUpdate(roomId);
        }
    });

    socket.on('chatMessage', (roomId, message) => {
        const room = rooms[roomId];
        if (!room) return;
        // Save the message in memory
        room.messages.push({ sender: socket.id, text: message });
        // Send chat update to all in room
        emitGameStateUpdate(roomId);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        for (const [rid, room] of Object.entries(rooms)) {
            if (room.players.includes(socket.id)) {
                room.players = room.players.filter(p => p !== socket.id);
                // If no players remain, delete the room entirely
                if (room.players.length === 0) {
                    delete rooms[rid];
                } else {
                    // One player left, session is terminated
                    room.gameState = {
                        message: "The other player left. Room is no longer active.",
                        roundOver: true,
                        sessionTerminated: true
                    };
                    // Clear messages as well or keep them? Let's keep them for reference
                    // room.messages = [];
                    emitGameStateUpdate(rid);
                }
            }
        }
    });
});

// Emit the current game state plus messages to all players in the room
function emitGameStateUpdate(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    const payload = { ...room.gameState, messages: room.messages || [] };
    io.to(roomId).emit('gameStateUpdate', payload);
}

// ---------------------------------------------
// Game Logic (Simplified)
// ---------------------------------------------

const SUITS = ["♥️", "♦️", "♣️", "♠️"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function createInitialGameState() {
    const { deck, playerHands, dealerHand, communityCards } = dealInitialCards();
    return {
        phase: 'preflop',
        deck,
        playerHands,     // [handForPlayer0, handForPlayer1]
        dealerHand,
        communityCards,
        message: '',
        roundOver: false,
        playerMapping: {} // Will be set once both players join
    };
}

function dealInitialCards() {
    let deck = initializeDeck();
    deck = shuffleDeck(deck);

    const playerHand1 = [deck[0], deck[1]];
    const playerHand2 = [deck[2], deck[3]];
    const dealerHand = [deck[4], deck[5]];

    const remainingDeck = deck.slice(6);
    const communityCards = [];

    return {
        deck: remainingDeck,
        playerHands: [playerHand1, playerHand2],
        dealerHand,
        communityCards
    };
}

function handleAction(state, action) {
    // action = { type: 'fold' | 'call' | 'raise' | 'playAgain' }
    if (action.type === 'fold') {
        state.message = 'A player folded. Dealer wins!';
        state.roundOver = true;
        return state;
    }

    if (action.type === 'playAgain') {
        const newState = createInitialGameState();
        newState.playerMapping = state.playerMapping;
        return newState;
    }

    if (action.type === 'call' || action.type === 'raise') {
        if (state.phase === 'preflop') {
            state.communityCards = state.deck.slice(0, 3);
            state.deck = state.deck.slice(3);
            state.phase = 'flop';
            state.message = 'Flop revealed';
        } else if (state.phase === 'flop') {
            state.communityCards.push(state.deck[0]);
            state.deck = state.deck.slice(1);
            state.phase = 'turn';
            state.message = 'Turn card revealed';
        } else if (state.phase === 'turn') {
            state.communityCards.push(state.deck[0]);
            state.deck = state.deck.slice(1);
            state.phase = 'river';
            state.message = 'River card revealed';
        } else if (state.phase === 'river') {
            return showdown(state);
        }
        return state;
    }

    return state;
}

function showdown(state) {
    const player1Score = evaluateSimpleHand([...state.playerHands[0], ...state.communityCards]);
    const player2Score = evaluateSimpleHand([...state.playerHands[1], ...state.communityCards]);
    const dealerScore = evaluateSimpleHand([...state.dealerHand, ...state.communityCards]);

    let msg = `Player1: ${player1Score}, Player2: ${player2Score}, Dealer: ${dealerScore}\n`;
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

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
