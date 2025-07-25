import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import { AvailableGame } from '../types';
import './GamesList.css';

const GamesList: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [games, setGames] = useState<AvailableGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !user) return;

    // Request games list
    socket.emit('get-games');

    // Socket event listeners
    socket.on('games-list', (gamesList: AvailableGame[]) => {
      setGames(gamesList);
      setIsLoading(false);
    });

    socket.on('game-created', ({ gameId }: { gameId: string }) => {
      navigate(`/game/${gameId}`);
    });

    socket.on('error', ({ message }: { message: string }) => {
      setError(message);
      setIsLoading(false);
    });

    return () => {
      socket.off('games-list');
      socket.off('game-created');
      socket.off('error');
    };
  }, [socket, user, navigate]);

  const handleCreateGame = () => {
    if (!socket || !user) return;
    
    setError(null);
    socket.emit('create-game', { user });
  };

  const handleJoinGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const gameTime = new Date(timestamp);
    const diffMs = now.getTime() - gameTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}z`;
  };

  if (isLoading) {
    return (
      <div className="games-list-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Încărcare jocuri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="games-list-container">
      <div className="games-header">
        <div className="header-content">
          <h1>🎴 Poker Live</h1>
          <div className="user-info">
            <span className="welcome-text">Salut, {user?.displayName}!</span>
            <button className="logout-btn" onClick={logout}>
              Ieși
            </button>
          </div>
        </div>
      </div>

      <div className="games-content">
        <div className="create-game-section">
          <div className="create-game-card">
            <h2>🚀 Creează un joc nou</h2>
            <p>Începe o masă de poker și invită-ți prietenii să se alăture!</p>
            <button 
              className="create-game-btn" 
              onClick={handleCreateGame}
              disabled={isLoading}
            >
              + Creează Joc
            </button>
          </div>
        </div>

        <div className="games-section">
          <h2>🎮 Jocuri disponibile</h2>
          
          {error && (
            <div className="error-banner">
              <p>❌ Eroare: {error}</p>
            </div>
          )}

          {games.length === 0 ? (
            <div className="no-games">
              <div className="no-games-content">
                <span className="no-games-icon">🃏</span>
                <h3>Niciun joc disponibil</h3>
                <p>Fii primul care creează un joc de poker!</p>
              </div>
            </div>
          ) : (
            <div className="games-grid">
              {games.map((game) => (
                <div key={game.id} className="game-card">
                  <div className="game-header">
                    <h3>Mesa #{game.id.slice(0, 8)}</h3>
                    <span className="game-time">{formatTimeAgo(game.createdAt)}</span>
                  </div>
                  
                  <div className="game-info">
                    <div className="game-creator">
                      <span className="creator-label">Creator:</span>
                      <span className="creator-name">{game.creator.displayName}</span>
                    </div>
                    
                    <div className="game-players">
                      <span className="players-count">
                        👥 {game.playerCount}/{game.maxPlayers} jucători
                      </span>
                    </div>
                    
                    <div className="game-status">
                      <span className={`status-badge status-${game.gameState}`}>
                        {game.gameState === 'waiting' ? '⏳ Așteptare' : '🎮 În curs'}
                      </span>
                    </div>
                  </div>

                  <div className="game-actions">
                    {game.gameState === 'waiting' && game.playerCount < game.maxPlayers ? (
                      <button 
                        className="join-game-btn"
                        onClick={() => handleJoinGame(game.id)}
                      >
                        🚪 Intră în joc
                      </button>
                    ) : (
                      <button 
                        className="spectate-btn"
                        onClick={() => handleJoinGame(game.id)}
                        disabled={game.playerCount >= game.maxPlayers}
                      >
                        👁️ Spectator
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamesList;