import { state } from "../state";
import { ActionType, Payload } from "../types";

export abstract class Action<P extends Payload> {
  abstract type: ActionType;
  abstract payload: P;
  abstract validate: () => boolean;
  abstract execute: () => string;
  abstract undo: () => string;

  protected pushHistory = () =>
    state.history.push({
      action: this.type,
      payload: this.payload,
    });

  protected popHistory = () => state.history.pop();
}
