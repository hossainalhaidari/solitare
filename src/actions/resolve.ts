import { getCardsOfType, getCurrentPile, state } from "../state";
import { ActionType, Card, CardType, ResolveType } from "../types";
import { Action } from "./action";

export type ResolvePayload = {
  resolveType: ResolveType;
  fromStack: number;
  cardType?: CardType;
};

export class Resolve extends Action<ResolvePayload> {
  type = ActionType.Resolve;
  payload: ResolvePayload = {
    resolveType: ResolveType.Stack,
    fromStack: 0,
  };

  constructor(payload: ResolvePayload) {
    super();
    this.payload = payload;
  }

  public validate = () => {
    switch (this.payload.resolveType) {
      case ResolveType.Stack:
        return true;
      case ResolveType.Pile:
        return state.pile.length > 0;
    }
  };

  public execute = () => {
    switch (this.payload.resolveType) {
      case ResolveType.Stack:
        return this.resolveStack();
      case ResolveType.Pile:
        return this.resolvePile();
    }
  };

  public undo = () => {
    switch (this.payload.resolveType) {
      case ResolveType.Stack:
        return this.undoStack();
      case ResolveType.Pile:
        return this.undoPile();
    }
  };

  private resolveStack = () => {
    if (!this.validate()) return "Can't resolve that card!";

    const card = state.stacks[this.payload.fromStack].slice(-1)[0];

    if (this.resolve(card)) {
      state.stacks[this.payload.fromStack] = state.stacks[
        this.payload.fromStack
      ].slice(0, -1);

      this.pushHistory();

      return `Resolved ${card.getName()}`;
    }

    return `Cannot resolve  ${card.getName()}`;
  };

  private undoStack = () => {
    const cards = getCardsOfType(this.payload.cardType);

    if (cards.length > 0) {
      const card = cards[cards.length - 1];
      state.stacks[this.payload.fromStack].push(card);
      cards.pop();

      this.popHistory();

      return `Undo: Resolving ${card.getName()}`;
    }

    return "Cannot undo resolved card!";
  };

  private resolvePile = () => {
    if (!this.validate()) return "Can't resolve that card!";

    const card = getCurrentPile();

    if (card && this.resolve(card)) {
      state.pile.splice(state.currentPile, 1);

      if (state.currentPile - 1 < 0) {
        state.currentPile = 0;
      } else {
        state.currentPile -= 1;
      }

      this.pushHistory();

      return `Resolved ${card.getName()}`;
    }

    return `Cannot resolve ${card?.getName()}`;
  };

  private undoPile = () => {
    const cards = getCardsOfType(this.payload.cardType);

    if (cards.length > 0) {
      const card = cards[cards.length - 1];

      if (state.currentPile + 1 > state.pile.length - 1) {
        state.pile.push(card);
        state.currentPile = state.pile.length - 1;
      } else {
        if (state.currentPile > 0) {
          state.currentPile += 1;
        }
        state.pile.splice(state.currentPile, 0, card);
      }
      cards.pop();

      this.popHistory();

      return `Undo: Resolving ${card.getName()}`;
    }

    return "Cannot undo resolved card!";
  };

  private resolve = (card: Card) => {
    this.payload.cardType = card.type;
    const cards = getCardsOfType(card.type);

    if (cards.length === 0) {
      if (card.code === 1) {
        cards.push(card);
        return true;
      }
    } else {
      if (card.code - cards[cards.length - 1].code === 1) {
        cards.push(card);
        return true;
      }
    }

    return false;
  };
}
