const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');

class PokerGame {
  constructor(id, creator) {
    this.id = id;
    this.creator = creator;
    this.players = new Map();
    this.gameState = 'waiting'; // waiting, playing, finished
    this.currentRound = 0;
    this.currentPlayerIndex = 0;
    this.pot = 0;
    this.currentBet = 0;
    this.communityCards = [];
    this.deck = [];
    this.dealerIndex = 0;
    this.smallBlind = 10;
    this.bigBlind = 20;
    this.roundName = 'preflop'; // preflop, flop, turn, river
    this.maxPlayers = 6;
    this.createdAt = new Date();
  }

  addPlayer(user) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Game is full');
    }
    
    if (this.gameState !== 'waiting') {
      throw new Error('Game already started');
    }

    const player = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      chips: 1000, // Starting chips
      cards: [],
      currentBet: 0,
      isActive: true,
      isFolded: false,
      isAllIn: false,
      position: this.players.size
    };

    this.players.set(user.id, player);
    return player;
  }

  removePlayer(userId) {
    this.players.delete(userId);
    if (this.players.size === 0) {
      this.gameState = 'finished';
    }
  }

  startGame() {
    if (this.players.size < 2) {
      throw new Error('Need at least 2 players to start');
    }

    this.gameState = 'playing';
    this.initializeDeck();
    this.dealCards();
    this.startBettingRound();
  }

  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    this.deck = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        this.deck.push({ suit, rank, value: this.getCardValue(rank) });
      });
    });
    
    this.deck = _.shuffle(this.deck);
  }

  getCardValue(rank) {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return parseInt(rank);
  }

  dealCards() {
    // Deal 2 cards to each player
    this.players.forEach(player => {
      player.cards = [this.deck.pop(), this.deck.pop()];
      player.isFolded = false;
      player.currentBet = 0;
    });
  }

  startBettingRound() {
    this.currentBet = 0;
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.size;
    
    // Set blinds for preflop
    if (this.roundName === 'preflop') {
      this.setBlinds();
    }
  }

  setBlinds() {
    const playersArray = Array.from(this.players.values());
    const smallBlindPlayer = playersArray[(this.dealerIndex + 1) % playersArray.length];
    const bigBlindPlayer = playersArray[(this.dealerIndex + 2) % playersArray.length];
    
    smallBlindPlayer.currentBet = this.smallBlind;
    smallBlindPlayer.chips -= this.smallBlind;
    this.pot += this.smallBlind;
    
    bigBlindPlayer.currentBet = this.bigBlind;
    bigBlindPlayer.chips -= this.bigBlind;
    this.pot += this.bigBlind;
    
    this.currentBet = this.bigBlind;
    this.currentPlayerIndex = (this.dealerIndex + 3) % this.players.size;
  }

  playerAction(playerId, action, amount = 0) {
    const player = this.players.get(playerId);
    if (!player || player.isFolded) {
      throw new Error('Invalid player or player has folded');
    }

    const playersArray = Array.from(this.players.values());
    const currentPlayer = playersArray[this.currentPlayerIndex];
    
    if (currentPlayer.id !== playerId) {
      throw new Error('Not your turn');
    }

    switch (action) {
      case 'fold':
        player.isFolded = true;
        break;
      
      case 'call':
        const callAmount = this.currentBet - player.currentBet;
        const actualCall = Math.min(callAmount, player.chips);
        player.currentBet += actualCall;
        player.chips -= actualCall;
        this.pot += actualCall;
        if (player.chips === 0) player.isAllIn = true;
        break;
      
      case 'raise':
        const totalBet = Math.min(amount, player.chips + player.currentBet);
        const raiseAmount = totalBet - player.currentBet;
        player.chips -= raiseAmount;
        player.currentBet = totalBet;
        this.pot += raiseAmount;
        this.currentBet = totalBet;
        if (player.chips === 0) player.isAllIn = true;
        break;
      
      case 'check':
        if (player.currentBet !== this.currentBet) {
          throw new Error('Cannot check, must call or raise');
        }
        break;
    }

    this.moveToNextPlayer();
    
    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.nextRound();
    }
  }

  moveToNextPlayer() {
    const playersArray = Array.from(this.players.values());
    let nextIndex = (this.currentPlayerIndex + 1) % playersArray.length;
    
    // Find next active player
    while (playersArray[nextIndex].isFolded || playersArray[nextIndex].isAllIn) {
      nextIndex = (nextIndex + 1) % playersArray.length;
      if (nextIndex === this.currentPlayerIndex) break; // All players folded/all-in
    }
    
    this.currentPlayerIndex = nextIndex;
  }

  isBettingRoundComplete() {
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isFolded && !p.isAllIn);
    
    if (activePlayers.length <= 1) return true;
    
    // Check if all active players have bet the same amount
    const currentBets = activePlayers.map(p => p.currentBet);
    return currentBets.every(bet => bet === this.currentBet);
  }

  nextRound() {
    // Reset current bets
    this.players.forEach(player => {
      player.currentBet = 0;
    });
    
    this.currentBet = 0;
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.size;

    switch (this.roundName) {
      case 'preflop':
        this.roundName = 'flop';
        this.communityCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
        break;
      case 'flop':
        this.roundName = 'turn';
        this.communityCards.push(this.deck.pop());
        break;
      case 'turn':
        this.roundName = 'river';
        this.communityCards.push(this.deck.pop());
        break;
      case 'river':
        this.endHand();
        return;
    }
  }

  endHand() {
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isFolded);
    
    if (activePlayers.length === 1) {
      // Only one player left, they win
      activePlayers[0].chips += this.pot;
    } else {
      // Determine winner by hand strength
      const winner = this.determineWinner(activePlayers);
      winner.chips += this.pot;
    }

    // Reset for next hand
    this.pot = 0;
    this.communityCards = [];
    this.roundName = 'preflop';
    this.currentRound++;
    this.dealerIndex = (this.dealerIndex + 1) % this.players.size;
    
    // Check if game should continue
    const playersWithChips = Array.from(this.players.values()).filter(p => p.chips > 0);
    if (playersWithChips.length <= 1) {
      this.gameState = 'finished';
    } else {
      // Start next hand
      this.initializeDeck();
      this.dealCards();
      this.startBettingRound();
    }
  }

  determineWinner(players) {
    // Simplified poker hand evaluation - in a real game you'd want more sophisticated logic
    // For now, just return a random player from active players
    return players[Math.floor(Math.random() * players.length)];
  }

  getGameState() {
    return {
      id: this.id,
      gameState: this.gameState,
      players: Array.from(this.players.values()).map(p => ({
        ...p,
        cards: p.isFolded ? [] : p.cards // Hide cards of folded players
      })),
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      currentPlayerIndex: this.currentPlayerIndex,
      roundName: this.roundName,
      dealerIndex: this.dealerIndex
    };
  }

  getPublicGameState() {
    return {
      id: this.id,
      gameState: this.gameState,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        username: p.username,
        displayName: p.displayName,
        chips: p.chips,
        currentBet: p.currentBet,
        isActive: p.isActive,
        isFolded: p.isFolded,
        isAllIn: p.isAllIn,
        position: p.position,
        cardCount: p.cards.length
      })),
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      currentPlayerIndex: this.currentPlayerIndex,
      roundName: this.roundName,
      dealerIndex: this.dealerIndex
    };
  }
}

module.exports = PokerGame;