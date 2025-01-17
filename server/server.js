const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 3001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

let rooms = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", (roomId, userName, callback) => {
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                gameState: null,
                messages: [],
                currentTurn: 0, // Initialize turn
                usernames: {},
                playAgainVotes: [],
            };
        }

        const room = rooms[roomId];

        if (room.players.length < 2) {
            room.players.push(socket.id);
            room.usernames[socket.id] = userName;

            socket.join(roomId);

            console.log(`Player ${userName} (${socket.id}) joined room ${roomId}`);
            callback({ status: "ok", playerCount: room.players.length });

            if (room.players.length === 2) {
                const initialState = createInitialGameState();
                initialState.playerMapping = {
                    [room.players[0]]: 0,
                    [room.players[1]]: 1,
                };
                room.gameState = initialState;
                emitGameStateUpdate(roomId);
            } else {
                emitGameStateUpdate(roomId); // Inform player 1 that they're waiting for another player
            }
        } else {
            callback({ status: "full" });
        }
    });


    socket.on("action", (roomId, action) => {
        const room = rooms[roomId];
        if (room && room.gameState) {
            const playerIndex = room.gameState.playerMapping[socket.id];
            if (playerIndex !== room.currentTurn) {
                socket.emit("invalidAction", "It's not your turn!");
                return;
            }

            // Update the game state based on the action
            const updatedState = handleAction(room.gameState, action, playerIndex);
            room.gameState = updatedState;

            // Move to the next player's turn
            room.currentTurn = (room.currentTurn + 1) % room.players.length;
            emitGameStateUpdate(roomId);
        }
    });

    socket.on("chatMessage", (roomId, message) => {
        const room = rooms[roomId];
        if (!room) return;

        room.messages.push({ sender: room.usernames[socket.id], text: message });
        emitGameStateUpdate(roomId);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        for (const [roomId, room] of Object.entries(rooms)) {
            if (room.players.includes(socket.id)) {
                room.players = room.players.filter((p) => p !== socket.id);
                delete room.usernames[socket.id];
                if (room.players.length === 0) {
                    delete rooms[roomId];
                } else {
                    room.gameState = {
                        message: "The other player has disconnected. Game terminated.",
                        roundOver: true,
                        sessionTerminated: true,
                    };
                    emitGameStateUpdate(roomId);
                }
            }
        }
    });
});

function emitGameStateUpdate(roomId) {
    const room = rooms[roomId];
    if (!room) return;

    const payload = {
        ...room.gameState,
        messages: room.messages || [],
        usernames: room.usernames,
        currentTurn: room.currentTurn,
    };
    io.to(roomId).emit("gameStateUpdate", payload);
}

function createInitialGameState() {
    const { deck, playerHands, dealerHand, communityCards } = dealInitialCards();
    return {
        phase: "preflop",
        deck,
        playerHands,
        dealerHand,
        communityCards,
        message: "",
        roundOver: false,
        playerMapping: {},
    };
}

function dealInitialCards() {
    let deck = initializeDeck();
    deck = shuffleDeck(deck);

    const playerHand1 = [deck[0], deck[1]];
    const playerHand2 = [deck[2], deck[3]];
    const dealerHand = [deck[4], deck[5]];

    const remainingDeck = deck.slice(6); // Remove dealt cards from the deck
    const communityCards = [];

    return {
        deck: remainingDeck,
        playerHands: [playerHand1, playerHand2],
        dealerHand,
        communityCards,
    };
}



function handleAction(state, action, playerIndex) {
    if (action.type === "fold") {
        state.message = `Player ${playerIndex + 1} folded. Dealer wins!`;
        state.roundOver = true;
        return state;
    }

    if (action.type === "playAgain") {
        const newState = createInitialGameState();
        newState.playerMapping = state.playerMapping;
        return newState;
    }

    if (action.type === "call" || action.type === "raise") {
        if (state.phase === "preflop") {
            state.communityCards = state.deck.slice(0, 3);
            state.deck = state.deck.slice(3);
            state.phase = "flop";
            state.message = "Flop revealed";
        } else if (state.phase === "flop") {
            state.communityCards.push(state.deck[0]);
            state.deck = state.deck.slice(1);
            state.phase = "turn";
            state.message = "Turn card revealed";
        } else if (state.phase === "turn") {
            state.communityCards.push(state.deck[0]);
            state.deck = state.deck.slice(1);
            state.phase = "river";
            state.message = "River card revealed";
        } else if (state.phase === "river") {
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
        msg += "It's a tie between: " + winners.join(" and ");
    } else {
        msg += winners[0] + " wins!";
    }

    state.message = msg;
    state.roundOver = true;
    return state;
}

function initializeDeck() {
    const SUITS = ["♥️", "♦️", "♣️", "♠️"];
    const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
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
        case "A": return 14;
        case "K": return 13;
        case "Q": return 12;
        case "J": return 11;
        default: return parseInt(rank, 10);
    }
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
