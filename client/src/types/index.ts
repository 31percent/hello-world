export interface User {
  id: string;
  username: string;
  displayName: string;
  photos?: Array<{ value: string }>;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

export interface Player {
  id: string;
  username: string;
  displayName: string;
  chips: number;
  cards: Card[];
  currentBet: number;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  position: number;
  cardCount?: number;
}

export interface GameState {
  id: string;
  gameState: 'waiting' | 'playing' | 'finished';
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  roundName: 'preflop' | 'flop' | 'turn' | 'river';
  dealerIndex: number;
}

export interface AvailableGame {
  id: string;
  creator: User;
  playerCount: number;
  maxPlayers: number;
  gameState: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

export interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export type PlayerAction = 'fold' | 'call' | 'raise' | 'check';

export interface SocketEvents {
  // Client to Server
  'join-game': { gameId: string; user: User };
  'create-game': { user: User };
  'start-game': { gameId: string; userId: string };
  'player-action': { gameId: string; userId: string; action: PlayerAction; amount?: number };
  'leave-game': { gameId: string; userId: string };
  'chat-message': { gameId: string; userId: string; message: string; username: string };
  'get-games': void;
  'reconnect-game': { gameId: string; userId: string };

  // Server to Client
  'game-created': { gameId: string; gameState: GameState };
  'game-state': GameState;
  'game-state-update': { gameState: GameState; lastAction: { playerId: string; action: PlayerAction; amount?: number } };
  'player-joined': { player: Player; gameState: GameState };
  'player-left': { playerId: string; gameState: GameState };
  'player-disconnected': { playerId: string; gameState: GameState };
  'player-reconnected': { playerId: string };
  'game-started': { gameState: GameState };
  'games-list': AvailableGame[];
  'private-cards': { cards: Card[] };
  'chat-message': ChatMessage;
  'error': { message: string };
}