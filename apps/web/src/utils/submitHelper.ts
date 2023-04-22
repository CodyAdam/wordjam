import { Direction, PlaceWord } from '../types/api';
import { BoardLetters, InventoryLetter, InventoryLetterPlaced } from '../types/board';
import { keyFromPos } from './posHelper';

// X axis : left to right
// Y axis : bottom to top

export function toPlaceWord(inventory: InventoryLetter[], boardLetters: BoardLetters): PlaceWord {
  const placedInventoryLetters: InventoryLetterPlaced[] = inventory.filter(
    (letter) => letter.position !== undefined,
  ) as InventoryLetterPlaced[];

  placedInventoryLetters.sort((a, b) => {
    if (a.position.x < b.position.x || a.position.y > b.position.y) {
      return -1;
    } else if (a.position.x > b.position.x || a.position.y < b.position.y) {
      return 1;
    } else {
      return 0;
    }
  });

  let letters: string[] = placedInventoryLetters.map((letter) => letter.letter.toLowerCase());
  if (letters.length === 0) {
    throw new Error('No letters placed');
  }

  // most top left letter
  let startPos = placedInventoryLetters[0].position;
  placedInventoryLetters.forEach((letter) => {
    if (letter.position.x < startPos.x || letter.position.y > startPos.y) {
      startPos = letter.position;
    }
  });

  // most bottom right letter
  let endPos = placedInventoryLetters[0].position;
  placedInventoryLetters.forEach((letter) => {
    if (letter.position.x > endPos.x || letter.position.y < endPos.y) {
      endPos = letter.position;
    }
  });

  const placedKeys = placedInventoryLetters.map((letter) => keyFromPos(letter.position));
  const boardLettersKeys = Array.from(boardLetters.keys());
  const allKeys = placedKeys.concat(boardLettersKeys);

  // for each pos from (top left) to (bottom right) if its not in allKeys then throw error
  let pos = {...startPos};
  while (keyFromPos(pos) !== keyFromPos(endPos)) {
    if (!allKeys.includes(keyFromPos(pos))) {
      throw new Error('There is a gap in the placed letters');  
    }
    if (pos.x < endPos.x) {
      pos.x++;
    } else if (pos.y > endPos.y) {
      pos.y--;
    }
  }


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

  console.log(startPos);

  return {
    startPos,
    letters,
    direction,
  };
}
