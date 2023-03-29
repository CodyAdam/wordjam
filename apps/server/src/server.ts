import {LoginResponse, LoginResponseType, WSMessage} from './types/ws';
import {Player} from './types/player';
import {BoardLetter, Direction, PlacedResponse, PlaceWord, Position} from './types/board';
import {Server} from 'socket.io';
import {DictionaryService} from "./Dictionary";

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
  socket.on('onLogin', (rawData) => {
    let message: WSMessage;
    try {
      message = JSON.parse(rawData.toString());
    } catch (e: any) {
      socket.emit("error", e.toString());
      return;
    }

    const username: string = message.data?.username || '';
    const token: string = message.token || '';
    socket.emit("token", JSON.stringify(Login(username, token)));
  });

  socket.on('onSubmit', (rawData) => {
    let message: WSMessage;
    try {
      message = JSON.parse(rawData.toString());
    } catch (e: any) {
      socket.emit("error",e.toString());
      return;
    }

    let response = checkLetterPlacedFromClient(message.data, message.token);
    if(response == PlacedResponse.OK) {
      putLettersOnBoard(message.data, message.token);
      sendBoardToAll();
    } else {
      socket.emit("onError", response);
    }
  });

  console.log('New connection');

  socket.emit("board", JSON.stringify(Array.from(board.values())));
});

function sendBoardToAll() {
  io.emit("board", JSON.stringify(Array.from(board.values())));
}

function Login(username: string, token: string): LoginResponse {
  let result: LoginResponse = { status: LoginResponseType.SUCCESS };
  // Token verification
  if (token !== '') {
    if(players.has(token)){
      result.username = players.get(token)?.username || '';
      result.status = LoginResponseType.SUCCESS;
    } else result.status = LoginResponseType.WRONG_TOKEN;
    return result;
  }
  // Player Username verification
  for (let p of players.values()) {
    if(p.username == username) {
      result.status = LoginResponseType.ALREADY_EXIST;
        return result;
    }
  }
  let newPlayer : Player = { username: username, token: generateToken(4), score:0, letters: []};
  players.set(newPlayer.token, newPlayer);
  result.token = newPlayer.token;
  console.log('New Player : ' + newPlayer.username);
  return result;
}

function putLettersOnBoard(data: PlaceWord, token: string){
    let currentPos: Position = data.startPos;
    let lettersToPlaced: string[] = data.letters;
    while(lettersToPlaced.length > 0){
        if(!hasLetter(currentPos)) {
          let newLetter = lettersToPlaced.shift() || "";
          board.set(currentPos.x + '_' + currentPos.y, {placedBy: players.get(token)?.username || "", timestamp: Date.now(), letter: newLetter, position: currentPos});
        }
        if(data.direction == Direction.DOWN) currentPos.y--;
        else currentPos.x++;
    }
}

export function checkLetterPlacedFromClient(data: PlaceWord, token: string) : PlacedResponse {
  let currentPos: Position = data.startPos;
  let word: string = "";
  let additionalWords: string[] = [];
  let playerLetters: string[] = players.get(token)?.letters || [];
  let lettersToPlaced: string[] = data.letters;
  while(lettersToPlaced.length > 0){
    if(hasLetter(currentPos)){
      word += board.get(currentPos.x + '_' + currentPos.y)?.letter;
    } else {
      let newLetter = lettersToPlaced.shift() || "";
      if(!playerLetters.includes(newLetter)){
        return PlacedResponse.PLAYER_DONT_HAVE_LETTERS;
      }
      let concurrentWord = detectWordFromInside(currentPos, (data.direction == Direction.DOWN ? Direction.RIGHT : Direction.DOWN));

      if(DictionaryService.wordExist(concurrentWord)) additionalWords.push(concurrentWord);
      else return PlacedResponse.INVALID_POSITION;

      playerLetters.splice(playerLetters.indexOf(newLetter, 0), 1);
      word += newLetter;
    }
    if(data.direction == Direction.DOWN) currentPos.y--;
    else currentPos.x++;
  }
  if(!DictionaryService.wordExist(word)) return PlacedResponse.WORD_NOT_EXIST;
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
