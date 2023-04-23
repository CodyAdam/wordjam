require('dotenv').config()
import { Player } from './types/Player';
import { Server } from 'socket.io';
import { GameInstance } from './GameInstance';
import { generateLetters, generateToken, getDatePlusCooldown } from './Utils';
import { LoginResponseType } from './types/responses/LoginResponseType';
import { PlaceWord } from './types/PlaceWord';
import { PlacedResponse } from './types/responses/PlacedResponse';
import { AddLetterResponse } from './types/responses/AddLetterResponse';
import { Config } from './Config';
import "reflect-metadata"
import {AppDataSource} from "./data-source";

(async () => {
  await AppDataSource.initialize()

  const io = new Server({
    cors: {
      origin: '*',
    },
  });

  const PORT = 8080;
  const devMode: boolean = false;
  let devModeHand: string[] = ['d', 'd', 'o', 'o', 'e', 'n', 'a', 't'];
  io.listen(PORT);

  console.log('Server started on port ' + PORT);

  let gameInstance = new GameInstance();

  console.log('GameInstance created');

  io.on('connection', async (socket) => {
    /**
     * ####  EVENT ON LOGIN ####
     * Call when a player want to log in with his token
     * @param token : string, token of the player
     */
    socket.on('onLogin', async (token: string) => {
      const player = await gameInstance.getPlayerByToken(token);
      if (player === undefined) return socket.emit('onLoginResponse', LoginResponseType.WRONG_TOKEN);

      socket.emit('onLoginResponse', LoginResponseType.SUCCESS);
      socket.emit('onToken', player.token);
      socket.emit('onUsername', player.username);
      socket.emit('onInventory', player.letters);
      socket.emit('onCooldown', gameInstance.playerCooldown(player.token));

      socket.emit('onScores', (await gameInstance.players()).map((player: Player) => {
        return {username: player.username, score: player.score};
      }));
    });

    /**
     * ####  EVENT ON REGISTER ####
     * Call when a player want to register with his username
     * @param username : string, username of the player
     */
    socket.on('onRegister', async (username: string) => {
      // Player Username verification
      if (! await gameInstance.checkUsernameAvailability(username))
        return socket.emit('onLoginResponse', LoginResponseType.ALREADY_EXIST);

      // Create new player
      let newPlayer = new Player()
      newPlayer.username = username
      newPlayer.token = generateToken(4)
      newPlayer.score = 0
      newPlayer.letters = devMode ? devModeHand : generateLetters(Config.MIN_HAND_LETTERS)
      newPlayer.cooldownTarget = new Date()

      await gameInstance.addPlayer(newPlayer);

      socket.emit('onLoginResponse', LoginResponseType.SUCCESS);
      socket.emit('onToken', newPlayer.token);
      socket.emit('onInventory', newPlayer.letters);
      socket.emit('onCooldown', gameInstance.playerCooldown(newPlayer.token));
      socket.emit('onScores', (await gameInstance.players()).map((player: Player) => {
        return {username: player.username, score: player.score};
      }));

      console.log('New Player : ' + newPlayer.username);
    });

    /**
     * ####  EVENT REPLACE ALL LETTERS ####
     * Call when a player want to get a new inventory of letters
     * @param token : string, token of the player
     */
    socket.on('onReplaceAllLetters', async (token: string) => {
      const player = await gameInstance.getPlayerByToken(token);
      if (player === undefined) return socket.emit('onError', 'Player not found');

      let response = gameInstance.replaceAllLetters(player);
      if (response === AddLetterResponse.SUCCESS) {
        socket.emit('onCooldown', gameInstance.playerCooldown(player.token));
        socket.emit('onInventory', player.letters);
      }
    });

    /**
     * ####  EVENT ON SUBMIT ####
     * Call when a player want to submit his word to the board
     * @param submittedLetters : PlaceWord, array of letters to place on the board
     * @param token : string, token of the player
     */
    socket.on('onSubmit', async ({submittedLetters, token}: { submittedLetters: PlaceWord; token: string }) => {
      const player = await gameInstance.getPlayerByToken(token);
      if (player === undefined) return socket.emit('onError', 'Player not found');
      if (
          Object.prototype.toString.call(submittedLetters.letters) !== Object.prototype.toString.call([]) ||
          submittedLetters.letters.length === 0
      )
        return socket.emit('onError', PlacedResponse.NO_LETTER_IN_REQUEST);

      let response = await gameInstance.submitWord(player, submittedLetters)
      if (response.highlight.positions.length > 0) socket.emit('onHighlight', response.highlight);
      if (response.placement !== PlacedResponse.OK) {
        return socket.emit('onError', response.placement);
      }
      socket.emit('onConfetti');
      await sendBoardToAll();
      await sendScoreToAll();
      socket.emit('onInventory', player.letters);
    });

    console.log('New web socket connection');
    socket.emit('onBoard', await gameInstance.board.board);
  });

  /**
   * Send the letters displayed on the board to all the players connected
   */
  async function sendBoardToAll() {
    io.emit('onBoard', await gameInstance.board.board);
  }

  async function sendScoreToAll() {
    io.emit('onScores', (await gameInstance.players()).map((player: Player) => {
      return {username: player.username, score: player.score};
    }));
  }

  if (devMode) {
    Config.LETTER_COOLDOWN = 0;
  }
})()