import { Player } from './types/Player';
import { DictionaryService } from './Dictionary';
import { BoardLetter } from './types/BoardLetter';
import { Position } from './types/Position';
import { PlaceWord } from './types/PlaceWord';
import { PlacedResponse } from './types/responses/PlacedResponse';
import { Direction } from './types/Direction';
import { CheckLetterResponse } from './types/CheckLetterResponse';
import { posEquals } from './Utils';
import { Config } from './Config';
import {AppDataSource} from "./data-source";
import {Repository} from "typeorm";

export class BoardManager {

  boardLetterRepository: Repository<BoardLetter> = AppDataSource.getRepository(BoardLetter)
  positionRepository: Repository<Position> = AppDataSource.getRepository(Position)
  playerRepository: Repository<Player> = AppDataSource.getRepository(Player)

  async init(initialWord: string = 'WORDJAM') {
    await this.defaultBoardSetup(initialWord);
    DictionaryService.addCustomWord(initialWord);
  }


  /**
   * Place the initial word on the board
   * @param word The word to be placed on the board
   */
  private async defaultBoardSetup(word: string) {
    await this.boardLetterRepository.clear()

    // offset the X pos so that the 0,0 pos is at the center of the word
    const offset = Math.floor(word.length / 2);
    for (let i = 0; i < word.length; i++) {
      const x = i - offset;

      let obj = this.boardLetterRepository.create({
        placedBy: 'Server',
        timestamp: Date.now(),
        letter: word[i],
        position: {x, y: 0},
      })
      await this.boardLetterRepository.save(obj)
    }
  }

  /**
   * Getter for the board map
   * @returns The board map
   */
  async board(): Promise<BoardLetter[]> {
    return await this.boardLetterRepository.find()
  }

  /**
   * Check if a letter is placed on the board at a given position
   * @param position The position to check
   * @returns true if a letter is placed on the board at the given position, false otherwise
   */
  private async hasLetter(position: Position): Promise<boolean> {
    return await this.positionRepository.exist({
      where: {
        x: position.x,
        y: position.y
      }
    })
  }

  async getLetter(position: Position): Promise<BoardLetter> {
    let res = await this.boardLetterRepository.findOne({
      where: {
        position: {
          x: position.x,
          y: position.y
        }
      }
    })
    if(!res)
      throw `Could not find letter at position ${position}`
    return res
  }

  /**
   * Check if a word can be placed on the board
   * @param data The data to check
   * @param player The player who wants to place the word
   * @returns A PlacedResponse
   */
  async checkLetterPlacedFromClient(data: PlaceWord, player: Player): Promise<CheckLetterResponse> {
    let currentPos: Position = Object.assign({}, data.startPos);
    let word: string = '';
    let score = 0;
    let additionalWords: string[] = [];
    let validPosition: boolean = false;
    let playerLetters: string[] = [...player.letters];
    let lettersToPlaced: string[] = [...data.letters];
    let lettersPositions: Position[] = [];

    let previousLetter = Object.assign({}, data.startPos);
    if (data.direction == Direction.DOWN) previousLetter.y++;
    else previousLetter.x--;
    while (await this.hasLetter(previousLetter)) {
      word = (await this.getLetter(previousLetter)).letter + word;
      lettersPositions.push(Object.assign({}, previousLetter));
      validPosition = true;
      if (data.direction == Direction.DOWN) previousLetter.y++;
      else previousLetter.x--;
    }

    while (lettersToPlaced.length > 0 || await this.hasLetter(currentPos)) {
      if (await this.hasLetter(currentPos)) {
        let letter = (await this.getLetter(currentPos)).letter;
        word += letter;
        validPosition = true;
        lettersPositions.push(Object.assign({}, currentPos));
      } else {
        let newLetter: string = lettersToPlaced.shift() || '';
        if (!playerLetters.includes(newLetter)) {
          return {
            placement: PlacedResponse.PLAYER_DONT_HAVE_LETTERS,
            score: 0,
            highlight: { positions: [], color: '' },
          };
        }
        let { concurrentWord, concurrentPos } = await this.detectWordFromInside(
          currentPos,
          data.direction == Direction.DOWN ? Direction.RIGHT : Direction.DOWN,
          newLetter,
        );

        if (concurrentWord.length > 1) {
          score += DictionaryService.getPointsOfWord(concurrentWord);
        }

        if (concurrentWord !== newLetter && DictionaryService.wordExist(concurrentWord)) {
          validPosition = true;
          additionalWords.push(concurrentWord);
          lettersPositions.push(...concurrentPos);
        } else if (concurrentWord !== newLetter) {
          return {
            placement: PlacedResponse.INVALID_POSITION.toString().replace('%WORD%', concurrentWord.toUpperCase()),
            score: 0,
            highlight: { positions: concurrentPos, color: Config.COLOR_HIGHLIGHT_ERROR },
          };
        } else {
          lettersPositions.push(Object.assign({}, currentPos));
        }

        playerLetters.splice(playerLetters.indexOf(newLetter, 0), 1);
        word += newLetter;
      }
      if (data.direction === Direction.DOWN) currentPos.y = currentPos.y - 1;
      else currentPos.x++;
    }
    if (!validPosition)
      return {
        placement: PlacedResponse.WORD_NOT_CONNECTED_TO_OTHERS,
        score: 0,
        highlight: { positions: lettersPositions, color: Config.COLOR_HIGHLIGHT_ERROR },
      };
    if (!DictionaryService.wordExist(word) && !(data.letters.length === 1 && word === data.letters[0]))
      return {
        placement: PlacedResponse.WORD_NOT_EXIST.toString().replace('%WORD%', word.toUpperCase()),
        score: 0,
        highlight: { positions: lettersPositions, color: Config.COLOR_HIGHLIGHT_ERROR },
      };

    score += DictionaryService.getPointsOfWord(word);
    return {
      placement: PlacedResponse.OK,
      score,
      highlight: { positions: lettersPositions, color: Config.COLOR_HIGHLIGHT_VALID },
    };
  }

  /**
   * Detect if there is a word on the board from a given position and a given direction
   * @param position The position of any letter of the word
   * @param direction The direction of the word
   * @param letter The letter to be placed on the board at the given position
   * @returns The word if it exists, an empty string otherwise
   */
  private async detectWordFromInside(
      position: Position,
      direction: Direction,
      letter: string,
  ): Promise<{ concurrentWord: string; concurrentPos: Position[] }> {
    let word: string = '';
    let currentPos: Position = Object.assign({}, position);
    while (await this.hasLetter(currentPos) || posEquals(currentPos, position)) {
      if (direction == Direction.DOWN) currentPos.y++;
      else currentPos.x--;
    }

    let positions: Position[] = [];
    if (direction == Direction.DOWN) currentPos.y--;
    else currentPos.x++;
    while (await this.hasLetter(currentPos) || posEquals(currentPos, position)) {
      if (!posEquals(currentPos, position)) word += (await this.getLetter(currentPos)).letter;
      else word += letter;
      positions.push(Object.assign({}, currentPos));
      if (direction == Direction.DOWN) currentPos.y--;
      else currentPos.x++;
    }

    return {concurrentWord: word, concurrentPos: positions};
  }

  /**
   * Place a word on the board
   * @param data The data to place
   * @param player The player who wants to place the word
   * @returns the score gains by the player
   */
  async putLettersOnBoard(data: PlaceWord, player: Player) {
    let currentPos: Position = Object.assign({}, data.startPos);
    let lettersToPlaced: string[] = [...data.letters];
    while (lettersToPlaced.length > 0) {
      if (!await this.hasLetter(currentPos)) {
        let newLetter = lettersToPlaced.shift() || '';
        let obj = this.boardLetterRepository.create({
          placedBy: player.username,
          timestamp: Date.now(),
          letter: newLetter,
          position: Object.assign({}, currentPos),
        })
        await this.boardLetterRepository.save(obj)
      }
      if (data.direction == Direction.DOWN) currentPos.y--;
      else currentPos.x++;
    }
    await this.removeLettersFromPlayer(player, data.letters);
  }

  /**
   * Remove letters from a player
   * @param player The player to remove letters from
   * @param letters The letters to remove
   */
  private async removeLettersFromPlayer(player: Player, letters: string[]) {
    player.letters = player.letters.filter((letter) => {
      const indexInToRemove = letters.indexOf(letter);
      if (indexInToRemove !== -1) {
        letters.splice(indexInToRemove, 1);
        return false;
      }
      return true;
    });
    await this.playerRepository.save(player)
  }

  async needInit(): Promise<boolean> {
    let count = await this.boardLetterRepository.count()
    return count == 0
  }
}
