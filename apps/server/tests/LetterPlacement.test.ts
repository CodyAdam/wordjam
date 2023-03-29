import { beforeEach, describe } from 'node:test';
import { PlacedResponse, PlaceWord, Direction } from '../src/types/board';
import { checkLetterPlacedFromClient } from '../src/server';
import { Player } from '../src/types/player';

describe('LetterPlacement', () => {
  beforeEach(() => {
    initServerPlaceWordsTest();
  });

  test('placeWords', () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const player: Player = {
      username: 'tester',
      token: 'test',
      cooldownTarget: oneHourAgo,
      score: 0,
      letters: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ],
    };
    if (!player) throw new Error('Player not found');
    expect(PlacedResponse.OK).toEqual(
      checkLetterPlacedFromClient({ letters: [], startPos: { x: 0, y: 0 }, direction: Direction.DOWN }, player),
    );
  });
});

function initServerPlaceWordsTest() {}
