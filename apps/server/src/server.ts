import {Player} from './types/Player';
import {Server} from 'socket.io';
import {GameInstance} from "./GameInstance";
import {generateLetters, generateToken, getDatePlusCooldown} from "./Utils";
import {LoginResponseType} from "./types/responses/LoginResponseType";
import {PlaceWord} from "./types/PlaceWord";
import {PlacedResponse} from "./types/responses/PlacedResponse";
import {AddLetterResponse} from "./types/responses/AddLetterResponse";

const io = new Server({
  cors: {
    origin: '*',
  },
});

const PORT = 8080;
io.listen(PORT);

console.log('Server started on port ' + PORT);

let gameInstance = new GameInstance();

console.log('GameInstance created');

io.on('connection', (socket) => {
  /**
   * ####  EVENT ON LOGIN ####
   * Call when a player want to log in with his token
   * @param token : string, token of the player
   */
  socket.on('onLogin', (token: string) => {
    const player = gameInstance.players.get(token);
    if (player === undefined) return socket.emit('onLoginResponse', LoginResponseType.WRONG_TOKEN);

    socket.emit('onLoginResponse', LoginResponseType.SUCCESS);
    socket.emit('onToken', player.token);
    socket.emit('onInventory', player.letters);
    socket.emit('onCooldown', gameInstance.playerCooldown(player.token));
  });

  /**
   * ####  EVENT ON REGISTER ####
   * Call when a player want to register with his username
   * @param username : string, username of the player
   */
  socket.on('onRegister', (username: string) => {
    // Player Username verification
    if(!gameInstance.checkUsernameAvailability(username)) return socket.emit('onLoginResponse', LoginResponseType.ALREADY_EXIST);

    // Create new player
    let newPlayer: Player = {
      username: username,
      token: generateToken(4),
      score: 0,
      letters: generateLetters(7),
      cooldownTarget: getDatePlusCooldown(),
    };
    gameInstance.addPlayer(newPlayer);

    socket.emit('onLoginResponse', LoginResponseType.SUCCESS);
    socket.emit('onToken', newPlayer.token);
    socket.emit('onInventory', newPlayer.letters);
    socket.emit('onCooldown', gameInstance.playerCooldown(newPlayer.token));

    console.log('New Player : ' + newPlayer.username);
  });

  /**
   * ####  EVENT ON ASK LETTER ####
   * Call when a player want to get a new letter in his inventory
   * @param token : string, token of the player
   */
  socket.on('onAskLetter', (token: string) => {
    const player = gameInstance.players.get(token);
    if (player === undefined) return socket.emit('onError', 'Player not found');

    let response = gameInstance.addLetterToPlayer(player);
    if(response === AddLetterResponse.SUCCESS) socket.emit('onInventory', player.letters);
  });

  /**
   * ####  EVENT ON SUBMIT ####
   * Call when a player want to submit his word to the board
   * @param submittedLetters : PlaceWord, array of letters to place on the board
   * @param token : string, token of the player
   */
  socket.on('onSubmit', ({ submittedLetters, token }: { submittedLetters: PlaceWord; token: string }) => {
    const player = gameInstance.players.get(token);
    if (player === undefined) return socket.emit('onError', 'Player not found');
    if(Object.prototype.toString.call(submittedLetters.letters) !== Object.prototype.toString.call( [] )
        || submittedLetters.letters.length === 0) return socket.emit('onError', PlacedResponse.NO_LETTER_IN_REQUEST);

    console.log(player)
    console.log(submittedLetters)

    let response = gameInstance.submitWord(player, submittedLetters)
    if (response !== PlacedResponse.OK) return socket.emit('onError', response);

    sendBoardToAll();
    sendScoreToAll();
    socket.emit('onInventory', player.letters);
  });

  console.log('New web socket connection');
  socket.emit('onBoard', Array.from(gameInstance.board.board.values()));
});

/**
 * Send the letters displayed on the board to all the players connected
 */
function sendBoardToAll() {
  io.emit('onBoard', Array.from(gameInstance.board.board.values()));
}
function sendScoreToAll(){
  io.emit('onScores', Array.from(gameInstance.players.values()))
}