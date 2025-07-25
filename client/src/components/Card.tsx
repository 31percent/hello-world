import React from 'react';
import { Card as CardType } from '../types';
import './Card.css';

interface CardProps {
  card: CardType;
  hidden?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({ card, hidden = false, size = 'medium' }) => {
  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getSuitColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  };

  if (hidden) {
    return (
      <div className={`card card-back card-${size}`}>
        <div className="card-pattern"></div>
      </div>
    );
  }

  const suitSymbol = getSuitSymbol(card.suit);
  const suitColor = getSuitColor(card.suit);

  return (
    <div className={`card card-${size} suit-${suitColor}`}>
      <div className="card-corner top-left">
        <div className="rank">{card.rank}</div>
        <div className="suit">{suitSymbol}</div>
      </div>
      <div className="card-center">
        <div className="suit-large">{suitSymbol}</div>
      </div>
      <div className="card-corner bottom-right">
        <div className="rank">{card.rank}</div>
        <div className="suit">{suitSymbol}</div>
      </div>
    </div>
  );
};

export default Card;