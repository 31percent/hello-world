const gameManager = require('../game/GameManager');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`);
    
    // Join game room
    socket.on('join-game', ({ gameId, user }) => {
      try {
        const { game } = gameManager.joinGame(gameId, user);
        gameManager.addPlayerSocket(user.id, socket.id);
        
        socket.join(gameId);
        socket.gameId = gameId;
        socket.userId = user.id;
        
        // Notify all players in the room
        io.to(gameId).emit('player-joined', {
          player: game.players.get(user.id),
          gameState: game.getPublicGameState()
        });
        
        // Send current game state to the joining player
        socket.emit('game-state', game.getGameState());
        
        console.log(`👤 ${user.displayName} joined game ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Create new game
    socket.on('create-game', ({ user }) => {
      try {
        const game = gameManager.createGame(user);
        gameManager.addPlayerSocket(user.id, socket.id);
        
        socket.join(game.id);
        socket.gameId = game.id;
        socket.userId = user.id;
        
        socket.emit('game-created', {
          gameId: game.id,
          gameState: game.getGameState()
        });
        
        // Broadcast updated games list
        io.emit('games-list', gameManager.getAvailableGames());
        
        console.log(`🎮 ${user.displayName} created game ${game.id}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Start game
    socket.on('start-game', ({ gameId, userId }) => {
      try {
        const game = gameManager.startGame(gameId, userId);
        
        io.to(gameId).emit('game-started', {
          gameState: game.getPublicGameState()
        });
        
        // Update games list
        io.emit('games-list', gameManager.getAvailableGames());
        
        console.log(`🚀 Game ${gameId} started`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Player action (fold, call, raise, check)
    socket.on('player-action', ({ gameId, userId, action, amount }) => {
      try {
        const game = gameManager.playerAction(gameId, userId, action, amount);
        
        // Send updated game state to all players
        io.to(gameId).emit('game-state-update', {
          gameState: game.getPublicGameState(),
          lastAction: {
            playerId: userId,
            action,
            amount
          }
        });
        
        // Send private cards to each player
        game.players.forEach((player, playerId) => {
          const playerSocket = gameManager.getPlayerSocket(playerId);
          if (playerSocket) {
            io.to(playerSocket).emit('private-cards', {
              cards: player.cards
            });
          }
        });
        
        console.log(`🎯 ${userId} performed ${action} in game ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Get available games
    socket.on('get-games', () => {
      socket.emit('games-list', gameManager.getAvailableGames());
    });

    // Leave game
    socket.on('leave-game', ({ gameId, userId }) => {
      try {
        const game = gameManager.leaveGame(gameId, userId);
        
        socket.leave(gameId);
        socket.gameId = null;
        socket.userId = null;
        
        if (game.players.size > 0) {
          io.to(gameId).emit('player-left', {
            playerId: userId,
            gameState: game.getPublicGameState()
          });
        }
        
        // Update games list
        io.emit('games-list', gameManager.getAvailableGames());
        
        console.log(`👋 ${userId} left game ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Chat message
    socket.on('chat-message', ({ gameId, userId, message, username }) => {
      if (socket.gameId === gameId) {
        io.to(gameId).emit('chat-message', {
          userId,
          username,
          message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      
      const userId = gameManager.removePlayerSocket(socket.id);
      
      if (socket.gameId && userId) {
        try {
          const game = gameManager.getGame(socket.gameId);
          if (game && game.players.size > 0) {
            io.to(socket.gameId).emit('player-disconnected', {
              playerId: userId,
              gameState: game.getPublicGameState()
            });
          }
          
          // Update games list
          io.emit('games-list', gameManager.getAvailableGames());
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });

    // Reconnect to game
    socket.on('reconnect-game', ({ gameId, userId }) => {
      try {
        const game = gameManager.getGame(gameId);
        if (game && game.players.has(userId)) {
          gameManager.addPlayerSocket(userId, socket.id);
          
          socket.join(gameId);
          socket.gameId = gameId;
          socket.userId = userId;
          
          // Send current game state
          socket.emit('game-state', game.getGameState());
          
          // Notify other players
          socket.to(gameId).emit('player-reconnected', {
            playerId: userId
          });
          
          console.log(`🔄 ${userId} reconnected to game ${gameId}`);
        } else {
          socket.emit('error', { message: 'Game not found or player not in game' });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
  });
}

module.exports = { setupSocketHandlers };