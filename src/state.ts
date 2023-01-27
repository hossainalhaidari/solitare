import { readFileSync, writeFileSync } from "fs";
import { CardType, GameState, MoveType, STATE_FILENAME } from "./types";
import { createCards, createStacks } from "./utils";

export const state: GameState = {
  currentPile: 0,
  pile: [],
  stacks: [],
  clubs: [],
  diamonds: [],
  hearts: [],
  spades: [],

  history: [],
  moveType: MoveType.None,

  x: 0,
  y: 0,
};

export const getCardsOfType = (cardType: CardType | null | undefined) => {
  switch (cardType) {
    case CardType.Club:
      return state.clubs;
    case CardType.Diamond:
      return state.diamonds;
    case CardType.Heart:
      return state.hearts;
    case CardType.Spade:
      return state.spades;
  }

  return [];
};

export const getCurrentPile = () => {
  if (state.pile.length === 0) return;
  return state.pile[state.currentPile];
};

export const resetState = () => {
  state.currentPile = 0;
  state.pile = [];
  state.stacks = [];
  state.clubs = [];
  state.diamonds = [];
  state.hearts = [];
  state.spades = [];
  state.history = [];
  state.moveType = MoveType.None;
  state.x = 0;
  state.y = 0;
};

export const saveState = () => {
  const {
    currentPile,
    pile,
    stacks,
    clubs,
    diamonds,
    hearts,
    spades,
    history,
    x,
    y,
  } = state;

  try {
    writeFileSync(
      STATE_FILENAME,
      JSON.stringify({
        currentPile,
        pile,
        stacks,
        clubs,
        diamonds,
        hearts,
        spades,
        history,
        x,
        y,
      })
    );

    return true;
  } catch {
    return false;
  }
};

export const loadState = () => {
  try {
    const newState = readFileSync(STATE_FILENAME);
    const newStateJson = JSON.parse(newState.toString());

    state.currentPile = newStateJson.currentPile;
    state.pile = createCards(newStateJson.pile);
    state.stacks = createStacks(newStateJson.stacks);
    state.clubs = createCards(newStateJson.clubs);
    state.diamonds = createCards(newStateJson.diamonds);
    state.hearts = createCards(newStateJson.hearts);
    state.spades = createCards(newStateJson.spades);
    state.history = newStateJson.history;
    state.moveType = MoveType.None;
    state.x = newStateJson.x;
    state.y = newStateJson.y;

    return true;
  } catch {
    return false;
  }
};
