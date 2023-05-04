export let SOCKET_URL : string;
if (process.env.NODE_ENV === 'production') {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  } else {
    throw new Error('NEXT_PUBLIC_SOCKET_URL is not defined');
  }
} else {
  SOCKET_URL = 'ws://localhost:8080';
}

export const TILE_SIZE = 20;
export const TILE_PADDING = .04;

export const SCROLL_SPEED = 0.2;
export const SCROLL_MIN_TILE_SIZE = 10;
export const SCROLL_MAX_TILE_SIZE = 400;
export const DRAG_TRESHOLD = 25;

export const TOUCH_ZOOM_SENSITIVITY = .3;

export const HIGHLIGHT_FADE_DURATION = 3000;
