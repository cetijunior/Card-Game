import React from 'react';
import Card from './Card';

export default function Hand({ cards, hidden }) {
    return (
        <div className="flex justify-center space-x-3">
            {cards.map((card, index) => (
                <Card key={index} card={card} hidden={hidden} />
            ))}
        </div>
    );
}
