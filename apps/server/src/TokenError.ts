export class TokenError extends Error{
    constructor() {
        super("Token not found");
    }
}