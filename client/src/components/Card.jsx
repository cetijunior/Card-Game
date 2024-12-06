import React from 'react';

export default function Card({ card, hidden }) {
    const suitColor = (card && (card.suit === '♥️' || card.suit === '♦️')) ? 'text-red-600' : 'text-black';
    const cardClasses = hidden
        ? "relative rounded-lg w-20 h-32 flex items-center justify-center shadow-lg bg-gradient-to-br from-red-800 to-red-900 text-transparent select-none"
        : `relative rounded-lg w-20 h-32 flex flex-col justify-between p-2 bg-white shadow-lg ${suitColor} border border-gray-300`;

    return (
        <div className={cardClasses}>
            {hidden ? (
                <div className="text-2xl text-white">
                    ?
                </div>
            ) : (
                <>
                    <div className="text-sm font-bold">{card.rank}{card.suit}</div>
                    <div className="flex items-center justify-center flex-1 text-2xl font-semibold">
                        {card.suit}
                    </div>
                    <div className="text-sm font-bold text-right">{card.rank}{card.suit}</div>
                </>
            )}
        </div>
    );
}
