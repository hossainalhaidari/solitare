import { state } from "../state";
import { ActionType } from "../types";
import { Action } from "./action";

export type NextInPilePayload = {};

export class NextInPile extends Action<NextInPilePayload> {
  type = ActionType.NextInPile;
  payload: NextInPilePayload = {};

  constructor(payload: NextInPilePayload) {
    super();
    this.payload = payload;
  }

  public validate = () => state.pile.length > 0;

  public execute = () => {
    if (!this.validate()) return "Can't show next in pile!";

    if (state.currentPile + 1 > state.pile.length - 1) {
      state.currentPile = 0;
    } else {
      state.currentPile += 1;
    }

    this.pushHistory();

    return "Showing next in pile";
  };

  public undo = () => {
    if (state.currentPile - 1 < 0) {
      state.currentPile = state.pile.length - 1;
    } else {
      state.currentPile -= 1;
    }

    this.popHistory();

    return "Undo: Showing next in pile";
  };
}
