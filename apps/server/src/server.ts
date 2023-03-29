import {LoginResponse, LoginResponseType, WSMessage} from './types/ws';
import {Player} from './types/player';
import {BoardLetter, Direction, PlaceWord, Position} from './types/board';
import {Server} from 'socket.io';
import {DictionaryService} from "./Dictionary";
import {Config} from "./config";

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
  socket.on('login', (rawData) => {
    let message: WSMessage;
    try {
      message = JSON.parse(rawData.toString());
    } catch (e: any) {
      socket.emit("error", e.toString());
      return;
    }

    const username: string = message.data?.username || '';
    const token: string = message.token || '';

    const loginResponse = Login(username, token)
    let player = getPlayer(loginResponse.token)
    socket.emit("token", JSON.stringify(loginResponse));
    socket.emit("setInventory", JSON.stringify(player.letters))
    socket.emit("onCooldown", JSON.stringify({
      timer: Config.LETTER_COOLDOWN
    }))
  });

  socket.on('onAskLetter', (rawData)=>{
    let message: WSMessage;
    try {
      message = JSON.parse(rawData.toString());
    } catch (e: any) {
      socket.emit("error", e.toString());
      return;
    }

    let player = getPlayer(message.token)
    addLetter(player)
    socket.emit("setInventory", JSON.stringify(player.letters))
  })

  socket.on('letterplaced', (rawData) => {
    let message: WSMessage;
    try {
      message = JSON.parse(rawData.toString());
    } catch (e: any) {
      socket.emit("error",e.toString());
      return;
    }

    LetterPlacedFromClient(message.data, message.token);
  });

  console.log('New connection');

  socket.emit("board", JSON.stringify(Array.from(board.values())));
});
function getPlayer(token: string | null | undefined): Player {
  if(token == null)
    throw new Error("Token not defined")
  let player = players.get(token)
  if(player == null)
    throw new Error("Player not found for this token")
  return player
}
function generateLetters(number: number): string[] {
  let letters = []
  for(let i=0; i<number; i++)
    letters.push(DictionaryService.getRandomLetter())
  return letters
}
function addLetter(player: Player){
  if(player.cooldownTarget > new Date())
    throw new Error("The cooldown is not over")
  player.letters.push(generateLetters(1)[0])
  player.cooldownTarget = getDatePlusCooldown()
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
  let newPlayer : Player = {
    username: username,
    token: generateToken(4),
    score:0,
    letters: generateLetters(7),
    cooldownTarget: getDatePlusCooldown()
  };
  players.set(newPlayer.token, newPlayer);
  result.token = newPlayer.token;
  console.log('New Player : ' + newPlayer.username);
  return result;
}

function getDatePlusCooldown(){
  return new Date(new Date().getTime() + Config.LETTER_COOLDOWN*1000)
}

function LetterPlacedFromClient(data: PlaceWord, token: string) {
  let currentPos: Position = data.startPos;
  let word: string = "";
  let playerLeters: string[] = players.get(token)?.letters || [];
  let lettersToPlaced: string[] = data.letters;
  while(lettersToPlaced.length > 0){
    if(hasLetter(currentPos)){
      word += board.get(currentPos.x + '_' + currentPos.y)?.letter;
    } else {
      word += lettersToPlaced.shift();
    }
    if(data.direction == Direction.DOWN) currentPos.y--;
    else currentPos.x++;
  }
  if(DictionaryService.wordExist(word)){

  }

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
  board.set('0_0', { placedBy: 'Server', timestamp: Date.now(), letter: 'M', position: { x: 0, y: 0 } });
  board.set('0_1', { placedBy: 'Server', timestamp: Date.now(), letter: 'A', position: { x: 0, y: 1 } });
  board.set('0_2', { placedBy: 'Server', timestamp: Date.now(), letter: 'E', position: { x: 0, y: 2 } });
  board.set('0_3', { placedBy: 'Server', timestamp: Date.now(), letter: 'L', position: { x: 0, y: 3 } });
  board.set('0_4', { placedBy: 'Server', timestamp: Date.now(), letter: 'O', position: { x: 0, y: 4 } });
}
