import { getCardsOfType, getCurrentPile, state } from "../state";
import { ActionType, Card, CardType, MoveType } from "../types";
import { Action } from "./action";

export type MovePayload = {
  moveType: MoveType;
  fromStack: number;
  count: number;
  fromCardType: CardType | null;
  toStack: number;
};

export class Move extends Action<MovePayload> {
  type = ActionType.Move;
  payload: MovePayload = {
    moveType: MoveType.None,
    fromStack: 0,
    count: 0,
    fromCardType: null,
    toStack: 0,
  };

  constructor(payload: MovePayload) {
    super();
    this.payload = payload;
  }

  public validate = () => {
    switch (this.payload.moveType) {
      case MoveType.Stack:
        const from = state.stacks[this.payload.fromStack].slice(
          state.stacks[this.payload.fromStack].length - this.payload.count
        );
        return this.checkBelowCards(from);
      case MoveType.Pile:
        return state.pile.length > 0;
      case MoveType.Resolved:
        return this.payload.fromCardType != null;
      default:
        return false;
    }
  };

  public execute = () => {
    switch (this.payload.moveType) {
      case MoveType.Stack:
        return this.moveFromStack();
      case MoveType.Pile:
        return this.moveFromPile();
      case MoveType.Resolved:
        return this.moveFromResolved();
      default:
        return "";
    }
  };

  public undo = () => {
    switch (this.payload.moveType) {
      case MoveType.Stack:
        return this.undoFromStack();
      case MoveType.Pile:
        return this.undoFromPile();
      case MoveType.Resolved:
        return this.undoFromResolved();
      default:
        return "";
    }
  };

  private moveFromStack = () => {
    if (!this.validate()) return "Can't move that card!";

    const from = state.stacks[this.payload.fromStack].slice(
      state.stacks[this.payload.fromStack].length - this.payload.count
    );
    const to = state.stacks[this.payload.toStack].slice(-1)[0];

    if (from.length === 0 || from[0].hidden) {
      return "Can't move that card!";
    }

    if (this.checkBelowCards(from) && this.canMove(from[0], to)) {
      state.stacks[this.payload.toStack].push(...from);
      state.stacks[this.payload.fromStack] = state.stacks[
        this.payload.fromStack
      ].slice(
        0,
        state.stacks[this.payload.fromStack].length - this.payload.count
      );

      this.pushHistory();

      return `Moved ${from[0].getName()} to ${to.getName()}`;
    }

    return `Can't move ${from[0].getName()} to ${to.getName()}`;
  };

  private undoFromStack = () => {
    const from = state.stacks[this.payload.toStack].slice(
      state.stacks[this.payload.toStack].length - this.payload.count
    );

    state.stacks[this.payload.fromStack].push(...from);
    state.stacks[this.payload.toStack] = state.stacks[
      this.payload.toStack
    ].slice(0, state.stacks[this.payload.toStack].length - this.payload.count);

    this.popHistory();

    return `Undo: Moving ${from[0].getName()}`;
  };

  private moveFromPile = () => {
    if (!this.validate()) return "Can't move that card!";

    const from = getCurrentPile()!;
    const to = state.stacks[this.payload.toStack].slice(-1)[0];

    if (this.canMove(from, to)) {
      state.stacks[this.payload.toStack].push(from);
      state.pile.splice(state.currentPile, 1);

      if (state.currentPile - 1 < 0) {
        state.currentPile = 0;
      } else {
        state.currentPile -= 1;
      }

      this.pushHistory();

      return `Moved ${from.getName()} to ${to.getName()}`;
    }

    return `Can't move ${from.getName()} to ${to.getName()}!`;
  };

  private undoFromPile = () => {
    const from = state.stacks[this.payload.toStack].slice(-1)[0];

    state.stacks[this.payload.toStack].pop();

    if (state.currentPile + 1 > state.pile.length - 1) {
      state.pile.push(from);
      state.currentPile = state.pile.length - 1;
    } else {
      if (state.currentPile > 0) {
        state.currentPile += 1;
      }
      state.pile.splice(state.currentPile, 0, from);
    }

    this.popHistory();

    return `Undo: Moving ${from.getName()}`;
  };

  private moveFromResolved = () => {
    if (!this.validate()) return "Can't move that card!";

    const fromResolved = getCardsOfType(this.payload.fromCardType);

    if (fromResolved.length === 0) {
      return "Resolved is empty!";
    }

    const from = fromResolved[fromResolved.length - 1];
    const to = state.stacks[this.payload.toStack].slice(-1)[0];

    if (this.canMove(from, to)) {
      state.stacks[this.payload.toStack].push(from);
      fromResolved.pop();

      this.pushHistory();

      return `Moved ${from.getName()} to ${to.getName()}`;
    }

    return `Can't move ${from.getName()} to ${to.getName()}!`;
  };

  private undoFromResolved = () => {
    const from = state.stacks[this.payload.toStack].slice(-1)[0];
    const toResolved = getCardsOfType(this.payload.fromCardType);

    toResolved.push(from);
    state.stacks[this.payload.toStack].pop();

    this.popHistory();

    return `Undo: Moving ${from.getName()}`;
  };

  private canMove = (from: Card, to: Card) => {
    if (!from || from.hidden) return false;
    if (!to) return from.code === 13;
    return to.code - from.code === 1 && from.getColor() !== to.getColor();
  };

  private checkBelowCards = (theCards: Card[]) => {
    for (let i = theCards.length - 1; i > 0; i--) {
      if (!this.canMove(theCards[i], theCards[i - 1])) {
        return false;
      }
    }

    return true;
  };
}
