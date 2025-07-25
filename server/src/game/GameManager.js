const { v4: uuidv4 } = require('uuid');
const PokerGame = require('./PokerGame');

class GameManager {
  constructor() {
    this.games = new Map();
    this.playerSockets = new Map(); // userId -> socketId
    this.socketPlayers = new Map(); // socketId -> userId
  }

  addPlayerSocket(userId, socketId) {
    this.playerSockets.set(userId, socketId);
    this.socketPlayers.set(socketId, userId);
  }

  removePlayerSocket(socketId) {
    const userId = this.socketPlayers.get(socketId);
    if (userId) {
      this.playerSockets.delete(userId);
      this.socketPlayers.delete(socketId);
      
      // Remove player from any active games
      this.games.forEach(game => {
        if (game.players.has(userId)) {
          game.removePlayer(userId);
          if (game.players.size === 0) {
            this.games.delete(game.id);
          }
        }
      });
    }
    return userId;
  }

  createGame(creator) {
    const gameId = uuidv4();
    const game = new PokerGame(gameId, creator);
    game.addPlayer(creator);
    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId, user) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    const player = game.addPlayer(user);
    return { game, player };
  }

  leaveGame(gameId, userId) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    game.removePlayer(userId);
    
    // Remove game if empty
    if (game.players.size === 0) {
      this.games.delete(gameId);
    }
    
    return game;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  getAllGames() {
    return Array.from(this.games.values()).map(game => ({
      id: game.id,
      creator: game.creator,
      playerCount: game.players.size,
      maxPlayers: game.maxPlayers,
      gameState: game.gameState,
      createdAt: game.createdAt
    }));
  }

  getAvailableGames() {
    return Array.from(this.games.values())
      .filter(game => game.gameState === 'waiting' && game.players.size < game.maxPlayers)
      .map(game => ({
        id: game.id,
        creator: game.creator,
        playerCount: game.players.size,
        maxPlayers: game.maxPlayers,
        gameState: game.gameState,
        createdAt: game.createdAt
      }));
  }

  playerAction(gameId, userId, action, amount) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    game.playerAction(userId, action, amount);
    return game;
  }

  startGame(gameId, userId) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.creator.id !== userId) {
      throw new Error('Only game creator can start the game');
    }
    
    game.startGame();
    return game;
  }

  getPlayerSocket(userId) {
    return this.playerSockets.get(userId);
  }

  getGamePlayers(gameId) {
    const game = this.games.get(gameId);
    if (!game) return [];
    
    return Array.from(game.players.values());
  }

  isPlayerInGame(userId) {
    for (const game of this.games.values()) {
      if (game.players.has(userId)) {
        return game;
      }
    }
    return null;
  }
}

module.exports = new GameManager();