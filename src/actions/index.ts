import { ActionType, HistoryItem } from "../types";
import { Move, MovePayload } from "./move";
import { NextInPile, NextInPilePayload } from "./nextInPile";
import { Resolve, ResolvePayload } from "./resolve";

export * from "./move";
export * from "./nextInPile";
export * from "./resolve";

export const validateAction = (historyItem: HistoryItem) => {
  switch (historyItem.action) {
    case ActionType.Move:
      const moveAction = new Move(historyItem.payload as MovePayload);
      return moveAction.validate();
    case ActionType.Resolve:
      const resolveAction = new Resolve(historyItem.payload as ResolvePayload);
      return resolveAction.validate();
    case ActionType.NextInPile:
      const nextInPileAction = new NextInPile(
        historyItem.payload as NextInPilePayload
      );
      return nextInPileAction.validate();
  }
};

export const executeAction = (historyItem: HistoryItem) => {
  switch (historyItem.action) {
    case ActionType.Move:
      const moveAction = new Move(historyItem.payload as MovePayload);
      return moveAction.execute();
    case ActionType.Resolve:
      const resolveAction = new Resolve(historyItem.payload as ResolvePayload);
      return resolveAction.execute();
    case ActionType.NextInPile:
      const nextInPileAction = new NextInPile(
        historyItem.payload as NextInPilePayload
      );
      return nextInPileAction.execute();
  }
};

export const undoAction = (historyItem: HistoryItem) => {
  switch (historyItem.action) {
    case ActionType.Move:
      const moveAction = new Move(historyItem.payload as MovePayload);
      return moveAction.undo();
    case ActionType.Resolve:
      const resolveAction = new Resolve(historyItem.payload as ResolvePayload);
      return resolveAction.undo();
    case ActionType.NextInPile:
      const nextInPileAction = new NextInPile(
        historyItem.payload as NextInPilePayload
      );
      return nextInPileAction.undo();
  }
};
