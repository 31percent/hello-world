import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import { GameState, Player, Card, ChatMessage, PlayerAction } from '../types';
import Card as CardComponent from './Card';
import PlayerSeat from './PlayerSeat';
import BettingControls from './BettingControls';
import Chat from './Chat';
import './PokerTable.css';

interface PokerTableProps {
  gameId: string;
}

const PokerTable: React.FC<PokerTableProps> = ({ gameId }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [privateCards, setPrivateCards] = useState<Card[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !user) return;

    // Join the game
    socket.emit('join-game', { gameId, user });

    // Socket event listeners
    socket.on('game-state', (state: GameState) => {
      setGameState(state);
      setIsLoading(false);
    });

    socket.on('game-state-update', ({ gameState: newState }: { gameState: GameState }) => {
      setGameState(newState);
    });

    socket.on('private-cards', ({ cards }: { cards: Card[] }) => {
      setPrivateCards(cards);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    socket.on('player-joined', ({ gameState: newState }: { gameState: GameState }) => {
      setGameState(newState);
    });

    socket.on('player-left', ({ gameState: newState }: { gameState: GameState }) => {
      setGameState(newState);
    });

    socket.on('game-started', ({ gameState: newState }: { gameState: GameState }) => {
      setGameState(newState);
    });

    socket.on('error', ({ message }: { message: string }) => {
      setError(message);
      setIsLoading(false);
    });

    return () => {
      socket.off('game-state');
      socket.off('game-state-update');
      socket.off('private-cards');
      socket.off('chat-message');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
      socket.off('error');
    };
  }, [socket, user, gameId]);

  const handlePlayerAction = (action: PlayerAction, amount?: number) => {
    if (!socket || !user || !gameState) return;
    
    socket.emit('player-action', {
      gameId,
      userId: user.id,
      action,
      amount
    });
  };

  const handleStartGame = () => {
    if (!socket || !user) return;
    
    socket.emit('start-game', {
      gameId,
      userId: user.id
    });
  };

  const handleSendMessage = (message: string) => {
    if (!socket || !user || !message.trim()) return;
    
    socket.emit('chat-message', {
      gameId,
      userId: user.id,
      message: message.trim(),
      username: user.displayName
    });
  };

  if (isLoading) {
    return (
      <div className="poker-table-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Încărcare joc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="poker-table-container">
        <div className="error-message">
          <p>Eroare: {error}</p>
          <button onClick={() => window.location.reload()}>Încearcă din nou</button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="poker-table-container">
        <div className="error-message">
          <p>Jocul nu a fost găsit</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === user?.id);
  const isCurrentPlayerTurn = currentPlayer && gameState.players[gameState.currentPlayerIndex]?.id === user?.id;
  const isGameCreator = gameState.players.find(p => p.id === user?.id)?.position === 0;

  return (
    <div className="poker-table-container">
      <div className="game-header">
        <div className="game-info">
          <h2>🎴 Poker Live - Mesa {gameState.id.slice(0, 8)}</h2>
          <div className="game-stats">
            <span className="pot-amount">Pot: ${gameState.pot}</span>
            <span className="round-name">{gameState.roundName}</span>
            <span className="current-bet">Pariu curent: ${gameState.currentBet}</span>
          </div>
        </div>
        
        {gameState.gameState === 'waiting' && isGameCreator && gameState.players.length >= 2 && (
          <button className="start-game-btn" onClick={handleStartGame}>
            Începe Jocul
          </button>
        )}
      </div>

      <div className="poker-table">
        <div className="table-surface">
          {/* Community Cards */}
          <div className="community-cards">
            <h3>Cărți comunitare</h3>
            <div className="cards-row">
              {gameState.communityCards.map((card, index) => (
                <CardComponent 
                  key={`${card.suit}-${card.rank}-${index}`} 
                  card={card} 
                  size="large"
                />
              ))}
              {Array.from({ length: 5 - gameState.communityCards.length }, (_, index) => (
                <CardComponent 
                  key={`empty-${index}`} 
                  card={{ suit: 'spades', rank: '', value: 0 }} 
                  hidden 
                  size="large"
                />
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="players-container">
            {gameState.players.map((player, index) => (
              <PlayerSeat
                key={player.id}
                player={player}
                isCurrentTurn={index === gameState.currentPlayerIndex}
                isDealer={index === gameState.dealerIndex}
                position={index}
                isCurrentUser={player.id === user?.id}
                privateCards={player.id === user?.id ? privateCards : []}
              />
            ))}
          </div>
        </div>

        {/* Your Cards */}
        {privateCards.length > 0 && (
          <div className="your-cards">
            <h3>Cărțile tale</h3>
            <div className="cards-row">
              {privateCards.map((card, index) => (
                <CardComponent 
                  key={`${card.suit}-${card.rank}-${index}`} 
                  card={card} 
                  size="large"
                />
              ))}
            </div>
          </div>
        )}

        {/* Betting Controls */}
        {gameState.gameState === 'playing' && isCurrentPlayerTurn && currentPlayer && (
          <BettingControls
            currentBet={gameState.currentBet}
            playerChips={currentPlayer.chips}
            playerCurrentBet={currentPlayer.currentBet}
            onAction={handlePlayerAction}
          />
        )}

        {gameState.gameState === 'waiting' && (
          <div className="waiting-message">
            <p>Așteptăm să înceapă jocul...</p>
            <p>Jucători: {gameState.players.length}/6</p>
          </div>
        )}
      </div>

      {/* Chat */}
      <Chat
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentUserId={user?.id || ''}
      />
    </div>
  );
};

export default PokerTable;