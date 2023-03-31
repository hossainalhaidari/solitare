import { Card, CardType } from "./types";

const getCardSymbol = (card: Card) => {
  switch (card.type) {
    case CardType.Club:
      return "♣";
    case CardType.Diamond:
      return "♦";
    case CardType.Heart:
      return "♥";
    case CardType.Spade:
      return "♠";
  }
};

const getCardColor = (card: Card) => {
  switch (card.type) {
    case CardType.Club:
    case CardType.Spade:
      return "black";
    case CardType.Diamond:
    case CardType.Heart:
      return "red";
  }
};

export const createCard = (
  code: number,
  type: CardType,
  hidden = true
): Card => {
  const card: Card = {
    code,
    type,
    hidden,
    getCode: () => "",
    getName: () => "",
    getColor: () => "",
    show: () => {},
  };

  card.getCode = () => {
    switch (card.code) {
      case 13:
        return "K";
      case 12:
        return "Q";
      case 11:
        return "J";
      case 10:
        return "X";
      case 1:
        return "A";
      default:
        return card.code.toString();
    }
  };

  card.getName = () => {
    if (card.hidden) return "--";
    return `${card.getCode()}${getCardSymbol(card)}`;
  };

  card.getColor = () => (card.hidden ? "white" : getCardColor(card));

  card.show = () => {
    card.hidden = false;
  };

  return card;
};

export const createCards = (cards: Card[]) => {
  if (cards.length === 0) return [];
  return cards.map((card) => createCard(card.code, card.type, card.hidden));
};

export const createStacks = (stacks: Card[][]) => {
  if (stacks.length === 0) return [];
  return stacks.map((stack) =>
    stack.map((card) => createCard(card.code, card.type, card.hidden))
  );
};

export const getLastCard = (cards: Card[]) =>
  cards.length === 0 ? null : cards[cards.length - 1];
