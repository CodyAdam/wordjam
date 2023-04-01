import { Direction, PlaceWord } from '../types/api';
import { InventoryLetter, InventoryLetterPlaced } from '../types/board';

export function toPlaceWord(inventory: InventoryLetter[]): PlaceWord {
  const placedInventoryLetters: InventoryLetterPlaced[] = inventory.filter(
    (letter) => letter.position !== undefined,
  ) as InventoryLetterPlaced[];
  const letters: string[] = placedInventoryLetters.map((letter) => letter.letter.toLowerCase());
  if (letters.length === 0) {
    throw new Error('No letters placed');
  }
  // most top left letter
  let startPos = placedInventoryLetters[0].position;
  placedInventoryLetters.forEach((letter) => {
    if (letter.position.x < startPos.x || letter.position.y < startPos.y) {
      startPos = letter.position;
    }
  });

  let isHorizontal = true;
  let isVertical = true;
  // check if it's horizontal or vertical
  placedInventoryLetters.forEach((letter) => {
    if (letter.position.y !== startPos.y) {
      isHorizontal = false;
    }
    if (letter.position.x !== startPos.x) {
      isVertical = false;
    }
  });

  if (!isHorizontal && !isVertical) {
    throw new Error('The placed letters are not in a straight line');
  }

  let direction = Direction.RIGHT;
  if (isVertical) {
    direction = Direction.DOWN;
  }
  return {
    startPos,
    letters,
    direction,
  };
}
