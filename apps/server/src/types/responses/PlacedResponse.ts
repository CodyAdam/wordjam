export enum PlacedResponse {
    OK = "OK",
    PLAYER_DONT_HAVE_LETTERS = "You do not have all the letters you are trying to place",
    INVALID_POSITION = "The word %WORD% is not valid",
    WORD_NOT_EXIST = "Some of the words you are trying to place do not exist",
    WORD_NOT_CONNECTED_TO_OTHERS = "You need to connect your word to at least one other word",
    NO_LETTER_IN_REQUEST = "You need to place at least one letter",
}