export const SOCKET_URL = process.env.NODE_ENV === 'production' ? 'ws://localhost:8080' : 'ws://localhost:8080';

export const TILE_SIZE = 20;

export const SCROLL_SPEED = 0.2;
export const SCROLL_MIN_TILE_SIZE = 10;
export const SCROLL_MAX_TILE_SIZE = 400;