export const STATE_FILENAME = ".soli-state";

export enum MoveType {
  None,
  Stack,
  Pile,
  Resolved,
}

export enum ResolveType {
  Stack,
  Pile,
}

export enum CardType {
  Club,
  Diamond,
  Heart,
  Spade,
}

export interface Card {
  code: number;
  type: CardType;
  hidden: boolean;
  getCode: () => string;
  getName: () => string;
  getColor: () => string;
  show: () => void;
}

export enum ActionType {
  Move,
  Resolve,
  NextInPile,
}

export interface Payload {}

export type HistoryItem = {
  action: ActionType;
  payload: Payload;
};

export type GameState = {
  currentPile: number;
  pile: Card[];
  stacks: Card[][];
  clubs: Card[];
  diamonds: Card[];
  hearts: Card[];
  spades: Card[];

  history: HistoryItem[];
  moveType: MoveType;

  x: number;
  y: number;
};
