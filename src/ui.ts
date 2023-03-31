import blessed, { button, Widgets } from "blessed";
import * as game from "./game";
import { executeAction, undoAction, validateAction } from "./actions";
import {
  getCardsOfType,
  getCurrentPile,
  loadState,
  resetState,
  saveState,
  state,
} from "./state";
import { ActionType, Card, CardType, MoveType, ResolveType } from "./types";
import { getLastCard } from "./utils";

const screen = blessed.screen();
const box = blessed.box({
  parent: screen,
  keys: true,
  width: "100%",
  height: "100%",
  content: "Solitare",
});
let matrix: Widgets.ButtonElement[][] = [];

let moveFromIndex = 0;
let moveFromStack = 0;
let moveFromCardType: CardType | null = null;

export const initUI = () => {
  screen.key("q", () => process.exit(0));
  screen.key("up", up);
  screen.key("left", left);
  screen.key("down", down);
  screen.key("right", right);
  screen.key("p", () => {
    const result = executeAction({
      action: ActionType.NextInPile,
      payload: {},
    });
    print(result);
    refreshUI();
  });
  screen.key("r", () => resolve());
  screen.key("a", () => {
    if (state.moveType === MoveType.None) {
      print(game.autoResolve());
      refreshUI();
    }
  });
  screen.key("u", () => undo());
  screen.key("space", () => {
    if (state.moveType === MoveType.None) {
      startMove();
    } else {
      endMove();
    }
  });
  screen.key("escape", () => {
    if (state.moveType !== MoveType.None) {
      state.moveType = MoveType.None;
      refreshUI();
    }
  });
  screen.key("s", () => {
    if (saveState()) {
      refreshUI();
      print("State saved!");
    } else {
      print("Cannot save state!");
    }
  });
  screen.key("l", () => {
    if (loadState()) {
      refreshUI();
      print("State loaded!");
    } else {
      print("Cannot load state!");
    }
  });
  screen.key("n", () => {
    if (game.isFinished()) {
      resetState();
      game.initGame();
      refreshUI();
      print("Solitare");
    }
  });

  refreshUI();
};

export const refreshUI = () => {
  game.reveal();

  matrix.map((buttons) => buttons.map((button) => box.remove(button)));
  matrix = [];

  for (let i = 0; i < 7; i++) {
    matrix.push(generateButtons(i));
  }

  if (state.moveType !== MoveType.None) {
    const stackButtons = [];
    for (let i = 0; i < 7; i++) {
      stackButtons.push(
        createButton({
          x: i,
          y: game.largestStack() + 1,
          content: `S${i + 1}`,
          bg: "blue",
        })
      );
    }
    matrix.push(stackButtons);
  }

  screen.render();
  resetFocus();

  if (game.isFinished()) {
    print("YOU WON! Press 'n' for a new game, 'q' to quit.");
  }
};

const print = (msg: string) => (box.content = msg);

const generateButtons = (index: number) => {
  const buttons = state.stacks[index].map((card, cardIndex) =>
    createCardButton(card, index, cardIndex + 1)
  );

  let topButton;
  switch (index) {
    case 0:
      topButton = createCardButton(getCurrentPile(), index, 0);
      break;
    case 3:
      topButton = createCardButton(getLastCard(state.spades), index, 0);
      break;
    case 4:
      topButton = createCardButton(getLastCard(state.hearts), index, 0);
      break;
    case 5:
      topButton = createCardButton(getLastCard(state.clubs), index, 0);
      break;
    case 6:
      topButton = createCardButton(getLastCard(state.diamonds), index, 0);
      break;
    default:
      topButton = createButton({ hidden: true });
      break;
  }

  buttons.splice(0, 0, topButton);
  return buttons;
};

const up = () => {
  if (state.moveType !== MoveType.None) return;
  if (state.y - 1 < 0) return;

  if (matrix[state.x][state.y - 1].hidden) {
    state.y = 0;
    if (getCurrentPile()) {
      state.x = 0;
    } else {
      state.x = 3;
    }
  } else {
    state.y -= 1;
  }

  updateFocus();
};

const down = () => {
  if (state.moveType !== MoveType.None) return;
  if (state.y + 1 > matrix[state.x].length - 1) {
    if (state.y > 0) return;

    const { x, y } = findNearestCard();
    state.x = x;
    state.y = y;
  } else {
    state.y += 1;
  }

  updateFocus();
};

const left = () => {
  if (state.moveType !== MoveType.None) {
    if (state.x - 1 >= 0) {
      state.x -= 1;
      updateFocus();
    }
    return;
  }

  if (state.x - 1 < 0) return;

  let tempX = state.x - 1;

  if (state.y === 0) {
    while (tempX > 0 && matrix[tempX][state.y].hidden) {
      tempX -= 1;
    }
    if (matrix[tempX][state.y].hidden) return;
  } else {
    while (tempX > 0 && matrix[tempX].length <= 1) {
      tempX -= 1;
    }
    if (matrix[tempX].length <= 1) return;

    if (state.y > matrix[tempX].length - 1) {
      state.y = matrix[tempX].length - 1;
    }
  }

  state.x = tempX;
  updateFocus();
};

const right = () => {
  if (state.moveType !== MoveType.None) {
    if (state.x + 1 < matrix.length - 1) {
      state.x += 1;
      updateFocus();
    }
    return;
  }

  if (state.x + 1 > matrix.length - 1) return;

  let tempX = state.x + 1;

  if (state.y === 0) {
    while (tempX < matrix.length - 1 && matrix[tempX][state.y].hidden) {
      tempX += 1;
    }
    if (matrix[tempX][state.y].hidden) return;
  } else {
    while (tempX < matrix.length - 1 && matrix[tempX].length <= 1) {
      tempX += 1;
    }
    if (matrix[tempX].length <= 1) return;

    if (state.y > matrix[tempX].length - 1) {
      state.y = matrix[tempX].length - 1;
    }
  }

  state.x = tempX;
  updateFocus();
};

const findNearestCard = () => {
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].length > 1) return { x: i, y: 1 };
  }

  return { x: matrix.length - 1, y: 0 };
};

const resetFocus = () => {
  let tempX = state.x;
  let tempY = state.y;

  if (tempX === 0 && tempY === 0) {
    if (matrix[tempX][tempY].hidden) {
      const res = findNearestCard();
      tempX = res.x;
      tempY = res.y;
    }
  } else {
    if (matrix[tempX].length === 1) {
      const res = findNearestCard();
      tempX = res.x;
      tempY = res.y;
    } else {
      while (tempY > 0 && tempY > matrix[tempX].length - 1) {
        tempY -= 1;
      }
    }
  }

  state.x = tempX;
  state.y = tempY;
  updateFocus();
};

const updateFocus = () =>
  setTimeout(() => {
    if (state.moveType === MoveType.None) {
      matrix[state.x][state.y].focus();
    } else {
      matrix[matrix.length - 1][state.x].focus();
    }
  }, 1);

const startMove = () => {
  if (state.x === 0 && state.y === 0 && getCurrentPile() != null) {
    state.moveType = MoveType.Pile;
    refreshUI();
  } else if (state.x > 0 && state.y === 0) {
    switch (state.x) {
      case 3:
        moveFromCardType = CardType.Spade;
        break;
      case 4:
        moveFromCardType = CardType.Heart;
        break;
      case 5:
        moveFromCardType = CardType.Club;
        break;
      case 6:
        moveFromCardType = CardType.Diamond;
        break;
      default:
        moveFromCardType = null;
        return;
    }

    if (getCardsOfType(moveFromCardType).length > 0) {
      state.x = 0;
      state.moveType = MoveType.Resolved;
      refreshUI();
    }
  } else if (state.y > 0) {
    const isValid = validateAction({
      action: ActionType.Move,
      payload: {
        moveType: MoveType.Stack,
        fromStack: state.x,
        count: matrix[state.x].length - state.y,
        fromCardType: null,
        toStack: 0,
      },
    });

    if (isValid) {
      moveFromIndex = state.y;
      moveFromStack = state.x;
      state.moveType = MoveType.Stack;
      refreshUI();
    }
  }
};

const endMove = () => {
  const result = executeAction({
    action: ActionType.Move,
    payload: {
      moveType: state.moveType,
      fromStack: moveFromStack,
      count: matrix[moveFromStack].length - moveFromIndex,
      fromCardType: moveFromCardType,
      toStack: state.x,
    },
  });
  print(result);

  state.y = state.stacks[state.x].length;
  state.moveType = MoveType.None;
  refreshUI();
};

const resolve = () => {
  if (state.y === 0) {
    if (state.x === 0) {
      const result = executeAction({
        action: ActionType.Resolve,
        payload: {
          resolveType: ResolveType.Pile,
          fromStack: 0,
        },
      });
      print(result);
      refreshUI();
    }
  } else if (state.y === matrix[state.x].length - 1) {
    const result = executeAction({
      action: ActionType.Resolve,
      payload: {
        resolveType: ResolveType.Stack,
        fromStack: state.x,
      },
    });
    print(result);
    refreshUI();
  }
};

const undo = () => {
  if (state.moveType === MoveType.None) {
    if (state.history.length === 0) {
      print("Nothing left to undo!");
    } else {
      const result = undoAction(state.history[state.history.length - 1]);
      print(result);
    }
    refreshUI();
  }
};

const createCardButton = (
  card: Card | null | undefined,
  x: number,
  y: number
) =>
  createButton({
    content: card?.getName() ?? "--",
    bg: card?.getColor() ?? "white",
    x,
    y,
  });

const createButton = ({
  content = "",
  bg = "black",
  x = 0,
  y = 0,
  hidden = false,
}: Partial<Widgets.ButtonOptions>) =>
  button({
    parent: box,
    hidden,
    keys: true,
    shrink: true,
    padding: {
      left: 1,
      right: 1,
    },
    left: x * 4,
    top: y + 1 + (y > 0 ? 1 : 0),
    name: content,
    content,
    style: {
      bg,
      focus: {
        bg: "yellow",
        fg: bg,
      },
    },
  });
