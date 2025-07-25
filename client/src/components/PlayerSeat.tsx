import React from 'react';
import { Player, Card } from '../types';
import Card as CardComponent from './Card';
import './PlayerSeat.css';

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  isDealer: boolean;
  position: number;
  isCurrentUser: boolean;
  privateCards: Card[];
}

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  isDealer,
  position,
  isCurrentUser,
  privateCards
}) => {
  const getSeatPosition = (position: number): string => {
    const positions = [
      'seat-bottom',
      'seat-bottom-left',
      'seat-top-left',
      'seat-top',
      'seat-top-right',
      'seat-bottom-right'
    ];
    return positions[position] || 'seat-bottom';
  };

  const getStatusText = (): string => {
    if (player.isFolded) return 'Fold';
    if (player.isAllIn) return 'All In';
    if (isCurrentTurn) return 'La rând';
    return '';
  };

  const getStatusClass = (): string => {
    if (player.isFolded) return 'status-folded';
    if (player.isAllIn) return 'status-all-in';
    if (isCurrentTurn) return 'status-current-turn';
    return '';
  };

  return (
    <div className={`player-seat ${getSeatPosition(position)} ${isCurrentTurn ? 'current-turn' : ''} ${isCurrentUser ? 'current-user' : ''}`}>
      {/* Dealer Button */}
      {isDealer && (
        <div className="dealer-button">
          <span>D</span>
        </div>
      )}

      {/* Player Info */}
      <div className="player-info">
        <div className="player-avatar">
          <span className="avatar-icon">👤</span>
        </div>
        
        <div className="player-details">
          <div className="player-name">{player.displayName}</div>
          <div className="player-chips">${player.chips}</div>
          {player.currentBet > 0 && (
            <div className="player-bet">Pariu: ${player.currentBet}</div>
          )}
        </div>
      </div>

      {/* Player Cards */}
      <div className="player-cards">
        {isCurrentUser && privateCards.length > 0 ? (
          // Show actual cards for current user
          privateCards.map((card, index) => (
            <CardComponent 
              key={`${card.suit}-${card.rank}-${index}`} 
              card={card} 
              size="small"
            />
          ))
        ) : player.cards && player.cards.length > 0 ? (
          // Show hidden cards for other players
          player.cards.map((_, index) => (
            <CardComponent 
              key={`hidden-${index}`} 
              card={{ suit: 'spades', rank: '', value: 0 }} 
              hidden 
              size="small"
            />
          ))
        ) : player.cardCount && player.cardCount > 0 ? (
          // Fallback to cardCount if cards array is not available
          Array.from({ length: player.cardCount }, (_, index) => (
            <CardComponent 
              key={`hidden-${index}`} 
              card={{ suit: 'spades', rank: '', value: 0 }} 
              hidden 
              size="small"
            />
          ))
        ) : null}
      </div>

      {/* Player Status */}
      {getStatusText() && (
        <div className={`player-status ${getStatusClass()}`}>
          {getStatusText()}
        </div>
      )}

      {/* Turn Indicator */}
      {isCurrentTurn && (
        <div className="turn-indicator">
          <div className="pulse-ring"></div>
        </div>
      )}
    </div>
  );
};

export default PlayerSeat;