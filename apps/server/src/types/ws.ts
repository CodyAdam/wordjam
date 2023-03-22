export type WSMessage = {
    data: any,
    token: string
}

export enum LoginResponseType {
    SUCCESS = "SUCCESS",
    WRONG_TOKEN = "WRONG_TOKEN",
    ALREADY_EXIST = "ALREADY_EXIST"
};

export type LoginResponse = {
    status: LoginResponseType,
    username?: string,
    letters?: string,
    token?: string
}