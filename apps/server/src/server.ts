import { Player } from './types/player';
import { PlacedResponse, PlaceWord } from './types/board';
import { Server } from 'socket.io';
import {GameInstance} from "./GameInstance";
import {generateLetters, generateToken, getDatePlusCooldown} from "./Utils";

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
    if (player === undefined) return socket.emit('onLoginResponse', 'WRONG_TOKEN');

    socket.emit('onLoginResponse', 'SUCCESS');
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
    if(!gameInstance.checkUsernameAvailability(username)) return socket.emit('onLoginResponse', 'ALREADY_EXIST');

    // Create new player
    let newPlayer: Player = {
      username: username,
      token: generateToken(4),
      score: 0,
      letters: generateLetters(7),
      cooldownTarget: getDatePlusCooldown(),
    };
    gameInstance.addPlayer(newPlayer);

    socket.emit('onLoginResponse', 'SUCCESS');
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

    gameInstance.addLetterToPlayer(player);
    socket.emit('setInventory', player.letters);
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

    let response = gameInstance.board.checkLetterPlacedFromClient(submittedLetters, player);
    if (response !== PlacedResponse.OK) return socket.emit('onError', response);

    gameInstance.board.putLettersOnBoard(submittedLetters, player);
    sendBoardToAll();
  });

  console.log('New web socket connection');
  socket.emit('onBoard', Array.from(gameInstance.board.board.values()));
});

function sendBoardToAll() {
  io.emit('onBoard', Array.from(gameInstance.board.board.values()));
}