import { LoginResponse, LoginResponseType, WSMessage } from './types/ws';
import { Player } from './types/player';
import { BoardLetter, Direction, PlacedResponse, PlaceWord, Position } from './types/board';
import { Server } from 'socket.io';
import { DictionaryService } from './Dictionary';
import { Config } from './config';

const io = new Server({
  cors: {
    origin: '*',
  },
});
const PORT = 8080;
io.listen(PORT);

let players = new Map<string, Player>();
let board = new Map<string, BoardLetter>();

console.log('Server started on port ' + PORT);

defaultBoardSetup();

io.on('connection', (socket) => {
  socket.on('onLogin', (token: string) => {
    const player = players.get(token);
    if (player === undefined) {
      socket.emit('onLoginResponse', 'WRONG_TOKEN');
      return;
    }
    socket.emit('onLoginResponse', 'SUCCESS');
    socket.emit('onToken', player.token);
    socket.emit('onInventory', player.letters);
    socket.emit('onCooldown', 0); // TODO : Calculate cooldown time
  });

  socket.on('onRegister', (username: string) => {
    // Player Username verification
    for (let p of players.values()) {
      if (p.username == username) {
        socket.emit('onLoginResponse', 'ALREADY_EXIST');
        return;
      }
    }

    // Create new player
    let newPlayer: Player = {
      username: username,
      token: generateToken(4),
      score: 0,
      letters: generateLetters(7),
      cooldownTarget: getDatePlusCooldown(),
    };
    players.set(newPlayer.token, newPlayer);

    socket.emit('onLoginResponse', 'SUCCESS');
    socket.emit('onToken', newPlayer.token);
    socket.emit('onInventory', newPlayer.letters);
    socket.emit('onCooldown', 0); // TODO : Calculate cooldown time

    console.log('New Player : ' + newPlayer.username);
  });

  socket.on('onAskLetter', (token: string) => {
    const player = players.get(token);
    if (player === undefined) {
      socket.emit('onError', 'Player not found');
      return;
    }

    addLetter(player);
    socket.emit('setInventory', player.letters);
  });

  socket.on('onSubmit', ({ submittedLetters, token }: { submittedLetters: PlaceWord; token: string }) => {
    const player = players.get(token);
    if (player === undefined) {
      socket.emit('onError', 'Player not found');
      return;
    }

    let response = checkLetterPlacedFromClient(submittedLetters, player);
    if (response !== PlacedResponse.OK) {
      socket.emit('onError', response);
      return;
    }

    putLettersOnBoard(submittedLetters, player);
    sendBoardToAll();
  });

  console.log('New connection');

  socket.emit('onBoard', Array.from(board.values()));
});

function sendBoardToAll() {
  io.emit('onBoard', Array.from(board.values()));
}

function generateLetters(number: number) {
  let letters = [];
  for (let i = 0; i < number; i++) letters.push(DictionaryService.getRandomLetter());
  return letters;
}
function addLetter(player: Player) {
  if (player.cooldownTarget > new Date()) throw new Error('The cooldown is not over');
  player.letters.push(generateLetters(1)[0]);
  player.cooldownTarget = getDatePlusCooldown();
}

function getDatePlusCooldown() {
  return new Date(new Date().getTime() + Config.LETTER_COOLDOWN * 1000);
}

function putLettersOnBoard(data: PlaceWord, player: Player) {
  let currentPos: Position = data.startPos;
  let lettersToPlaced: string[] = data.letters;
  while (lettersToPlaced.length > 0) {
    if (!hasLetter(currentPos)) {
      let newLetter = lettersToPlaced.shift() || '';
      board.set(currentPos.x + '_' + currentPos.y, {
        placedBy: player.username,
        timestamp: Date.now(),
        letter: newLetter,
        position: currentPos,
      });
    }
    if (data.direction == Direction.DOWN) currentPos.y--;
    else currentPos.x++;
  }
}

export function checkLetterPlacedFromClient(data: PlaceWord, player: Player): PlacedResponse {
  let currentPos: Position = data.startPos;
  let word: string = '';
  let additionalWords: string[] = [];
  let playerLetters: string[] = player.letters;
  let lettersToPlaced: string[] = data.letters;
  while (lettersToPlaced.length > 0) {
    if (hasLetter(currentPos)) {
      word += board.get(currentPos.x + '_' + currentPos.y)?.letter;
    } else {
      let newLetter = lettersToPlaced.shift() || '';
      if (!playerLetters.includes(newLetter)) {
        return PlacedResponse.PLAYER_DONT_HAVE_LETTERS;
      }
      let concurrentWord = detectWordFromInside(
        currentPos,
        data.direction == Direction.DOWN ? Direction.RIGHT : Direction.DOWN,
      );

      if (DictionaryService.wordExist(concurrentWord)) additionalWords.push(concurrentWord);
      else return PlacedResponse.INVALID_POSITION;

      playerLetters.splice(playerLetters.indexOf(newLetter, 0), 1);
      word += newLetter;
    }
    if (data.direction == Direction.DOWN) currentPos.y--;
    else currentPos.x++;
  }
  if (!DictionaryService.wordExist(word)) return PlacedResponse.WORD_NOT_EXIST;
  return PlacedResponse.OK;
}

function detectWordFromInside(position: Position, direction: Direction): string {
  let word = '';
  let currentPos: Position = position;
  while (hasLetter(currentPos)) {
    if (direction == Direction.DOWN) currentPos.y++;
    else currentPos.x--;
  }

  if (direction == Direction.DOWN) currentPos.y--;
  else currentPos.x++;
  while (hasLetter(currentPos)) {
    word += board.get(currentPos.x + '_' + currentPos.y)?.letter;
    if (direction == Direction.DOWN) currentPos.y--;
    else currentPos.x++;
  }

  return word;
}

function hasLetter(position: Position): boolean {
  return board.has(position.x + '_' + position.y);
}

function generateToken(len: number): string {
  let text = '';
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < len; i++) text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
}

function defaultBoardSetup() {
  board.set('0_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'W', position: { x: 0, y: 0 } });
  board.set('1_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'O', position: { x: 1, y: 0 } });
  board.set('2_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'R', position: { x: 2, y: 0 } });
  board.set('3_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'D', position: { x: 3, y: 0 } });
  board.set('4_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'J', position: { x: 4, y: 0 } });
  board.set('5_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'A', position: { x: 5, y: 0 } });
  board.set('6_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'M', position: { x: 6, y: 0 } });
}
