export const SUITS = ["♥️", "♦️", "♣️", "♠️"];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export function getSuitName(suit) {
    switch (suit) {
        case "♥️": return "hearts";
        case "♦️": return "diamonds";
        case "♣️": return "clubs";
        case "♠️": return "spades";
        default: return "";
    }
}

export function initializeDeck() {
    const deck = [];
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            deck.push({ rank, suit, display: `${rank}${suit}`, suitName: getSuitName(suit) });
        }
    }
    return deck;
}

export function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Simple scoring placeholder (for demonstration):
// In real poker, you must evaluate best 5-card hand from 7 cards.
export function evaluateTexasHoldemHand(holeCards, communityCards) {
    // Combine all cards
    const allCards = [...holeCards, ...communityCards];
    // TODO: Implement proper poker hand evaluation.
    // For now, just sum ranks to have a winner logic demonstration.
    let score = 0;
    for (let card of allCards) {
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
