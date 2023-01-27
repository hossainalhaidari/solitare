import { executeAction } from "./actions";
import { state } from "./state";
import { ActionType, Card, CardType, ResolveType } from "./types";
import { createCard } from "./utils";

export const initGame = () => {
  const cards: Card[] = [];
  for (let i = 1; i < 14; i++) {
    cards.push(createCard(i, CardType.Club));
    cards.push(createCard(i, CardType.Diamond));
    cards.push(createCard(i, CardType.Heart));
    cards.push(createCard(i, CardType.Spade));
  }
  const shuffled = cards.sort(() => Math.random() - 0.5);

  state.stacks.push(shuffled.slice(0, 1));
  state.stacks.push(shuffled.slice(1, 3));
  state.stacks.push(shuffled.slice(3, 6));
  state.stacks.push(shuffled.slice(6, 10));
  state.stacks.push(shuffled.slice(10, 15));
  state.stacks.push(shuffled.slice(15, 21));
  state.stacks.push(shuffled.slice(21, 28));
  state.pile.push(...shuffled.slice(28, 52));
  state.pile.map((card) => card.show());
};

const countResolved = () =>
  state.clubs.length +
  state.diamonds.length +
  state.hearts.length +
  state.spades.length;

export const isFinished = () => countResolved() === 52;

export const largestStack = () => {
  let largest = 0;

  state.stacks.forEach((stack) => {
    if (stack.length > largest) largest = stack.length;
  });

  return largest;
};

export const reveal = () => {
  for (let i = 0; i < 7; i++) {
    if (state.stacks[i].length > 0)
      state.stacks[i][state.stacks[i].length - 1].show();
  }
};

export const autoResolve = () => {
  const initialCount = countResolved();
  let currentCount = 0;

  do {
    currentCount = countResolved();

    executeAction({
      action: ActionType.Resolve,
      payload: {
        resolveType: ResolveType.Pile,
        fromStack: 0,
      },
    });

    state.stacks.forEach((_, index) => {
      executeAction({
        action: ActionType.Resolve,
        payload: {
          resolveType: ResolveType.Stack,
          fromStack: index,
        },
      });
    });
  } while (countResolved() != currentCount);

  const totalResolved = currentCount - initialCount;
  return totalResolved === 0
    ? "Nothing to resolve!"
    : `Auto-resolved ${totalResolved} card(s)`;
};
