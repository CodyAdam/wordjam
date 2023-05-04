import { TILE_PADDING, TILE_SIZE } from '../lib/constants';
import { Direction, Position } from '../types/api';
import { BoardLetters, Highlight, InventoryLetter } from '../types/board';
import { Pan } from '../types/canvas';
import { boardFont } from './fontLoader';
import { isInBound, posCeil, posCentered, posFloor, screenToWorld, worldToScreen } from './posHelper';
import { Draft } from '@/src/types/Draft';

const colorDraft = '#FFA3FC77';

export function drawGrid(ctx: CanvasRenderingContext2D, pan: Pan, width: number, height: number) {
  ctx.beginPath();
  ctx.strokeStyle = 'lightgrey';
  ctx.lineWidth = 1;
  const minBottomLeft = posFloor(screenToWorld({ x: -1, y: height + 1 }, pan));
  const maxTopRight = posCeil(screenToWorld({ x: width + 1, y: -1 }, pan));

  // vertical lines
  for (let x = minBottomLeft.x; x <= maxTopRight.x; x++) {
    const pos = worldToScreen({ x, y: minBottomLeft.y }, pan);
    ctx.moveTo(pos.x, pos.y);
    const pos2 = worldToScreen({ x, y: maxTopRight.y }, pan);
    ctx.lineTo(pos2.x, pos2.y);
  }
  // horizontal lines
  for (let y = minBottomLeft.y; y <= maxTopRight.y; y++) {
    const pos = worldToScreen({ x: minBottomLeft.x, y }, pan);
    ctx.moveTo(pos.x, pos.y);
    const pos2 = worldToScreen({ x: maxTopRight.x, y }, pan);
    ctx.lineTo(pos2.x, pos2.y);
  }

  ctx.stroke();
}

export function drawDebug(ctx: CanvasRenderingContext2D, pos: Position, text: string, color: string, pan: Pan) {
  // circle on origin
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  pos = worldToScreen(pos, pan);

  ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
  ctx.stroke();
  // text on origin
  ctx.font = '20px Arial';
  ctx.fillStyle = color;
  ctx.fillText(text, pos.x, pos.y + 20);
}

export function drawDraft(ctx: CanvasRenderingContext2D, draft: Draft, pan: Pan) {
  draft.letters.forEach((l) => {
    drawLetter(ctx, '×', l, colorDraft, pan, null);
  });

  draft.cursors.forEach((c) => {
    drawCursor_(
      ctx,
      {
        x: c.position.x + 0.5,
        y: c.position.y + 0.5,
      },
      c.direction == Direction.RIGHT,
      false,
      colorDraft,
      pan,
    );
  });
}

function drawLetter(
  ctx: CanvasRenderingContext2D,
  letter: string,
  position: Position,
  color: string,
  pan: Pan,
  highlight: Highlight,
) {
  ctx.fillStyle = color;
  const pos = worldToScreen(posCentered(position), pan);

  // use scaled font size
  const fontSize = pan.scale * TILE_SIZE * 0.035;
  ctx.font = `${fontSize}px ${boardFont.style.fontFamily}`;

  // offset by .5 of the letter width to center it same for height
  const letterOffset = { x: ctx.measureText(letter.toUpperCase()).width / 2, y: fontSize / 2.9 };

  ctx.fillText(letter.toUpperCase(), pos.x - letterOffset.x, pos.y + letterOffset.y);
}

export function drawPlacedLetters(
  ctx: CanvasRenderingContext2D,
  placedLetters: BoardLetters,
  pan: Pan,
  highlight: Highlight,
  width: number,
  height: number,
) {
  placedLetters.forEach((letter) => {
    if (!letter.position) return;
    if (!isInBound(letter.position, pan, width, height)) return;

    let color = 'rgb(63 63 70)';
    drawLetter(ctx, letter.letter, letter.position, color, pan, highlight);
  });
}

export function drawPlacedInventoryLetters(
  ctx: CanvasRenderingContext2D,
  placedLetters: InventoryLetter[],
  pan: Pan,
  highlight: Highlight,
  width: number,
  height: number,
) {
  placedLetters.forEach((letter) => {
    if (!letter.position) return;
    if (!isInBound(letter.position, pan, width, height)) return;

    ctx.fillStyle = '#fb923c';
    if (highlight && highlight.positions.some((pos) => pos.x === letter.position!.x && pos.y === letter.position!.y)) {
      ctx.fillStyle = highlight.color;
    }

    const pos = worldToScreen(posCentered(letter.position), pan);

    // use scaled font size
    const fontSize = pan.scale * TILE_SIZE * 0.035;
    ctx.font = `${fontSize}px ${boardFont.style.fontFamily}`;

    // offset by .5 of the letter width to center it same for height
    const letterOffset = { x: ctx.measureText(letter.letter.toUpperCase()).width / 2, y: fontSize / 2.9 };
    ctx.fillText(letter.letter.toUpperCase(), pos.x - letterOffset.x, pos.y + letterOffset.y);
  });
}

export function drawDarkenTile(ctx: CanvasRenderingContext2D, pos: Position, pan: Pan) {
  pos = worldToScreen(pos, pan);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  const padding = TILE_PADDING * pan.scale;
  ctx.beginPath();
  ctx.roundRect(
    pos.x + padding,
    pos.y - pan.scale + padding,
    pan.scale - padding * 2,
    pan.scale - padding * 2,
    0.15 * pan.scale, // rounded radius
  );
  ctx.fill();
}

function drawCursor_(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  direction: boolean,
  variant: boolean,
  color: string,
  pan: Pan,
) {
  pos = worldToScreen(pos, pan);
  let scale, vw, vh, path;

  if (!variant) {
    scale = 0.0012;
    vw = 256;
    vh = 512;
    // viewBox="0 0 256 512"
    path = new Path2D(
      'M.1 29.3C-1.4 47 11.7 62.4 29.3 63.9l8 .7C70.5 67.3 96 95 96 128.3V224H64c-17.7 0-32 14.3-32 32s14.3 32 32 32h32v95.7c0 33.3-25.5 61-58.7 63.8l-8 .7C11.7 449.6-1.4 465 .1 482.7s16.9 30.7 34.5 29.2l8-.7c34.1-2.8 64.2-18.9 85.4-42.9c21.2 24 51.2 40.1 85.4 42.9l8 .7c17.6 1.5 33.1-11.6 34.5-29.2s-11.6-33.1-29.2-34.5l-8-.7c-33.2-2.8-58.7-30.5-58.7-63.8V288h32c17.7 0 32-14.3 32-32s-14.3-32-32-32h-32v-95.7c0-33.3 25.5-61 58.7-63.8l8-.7c17.6-1.5 30.7-16.9 29.2-34.5S239-1.4 221.3.1l-8 .7c-34.1 2.8-64.1 18.9-85.3 42.9c-21.2-24-51.2-40-85.4-42.9l-8-.7C17-1.4 1.6 11.7.1 29.3z',
    );
  } else {
    vw = 14;
    vh = 14;
    scale = 0.05;
    path = new Path2D(
      'M10.5.5h2a1 1 0 0 1 1 1v2m-13 0v-2a1 1 0 0 1 1-1h2m7 13h2a1 1 0 0 0 1-1v-2m-13 0v2a1 1 0 0 0 1 1h2',
    );
  }

  // move
  ctx.translate(pos.x, pos.y);
  // scale
  ctx.scale(pan.scale / (1 / scale), pan.scale / (1 / scale));
  // center
  ctx.translate(-(vw / 2), -(vh / 2));
  // rotate 90deg if direction is false
  if (!direction && !variant) {
    ctx.translate(vw / 2 + vh / 2, vw / 2);
    ctx.rotate(Math.PI / 2);
  }

  // DRAW
  if (variant) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 2.3;
    ctx.stroke(path);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke(path);
  } else {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 45;
    ctx.stroke(path);
    ctx.fill(path, 'evenodd');
  }

  // reset
  if (!direction && !variant) {
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-(vw / 2) - vh / 2, -(vw / 2));
  }
  ctx.translate(vw / 2, vh / 2);
  ctx.scale(1 / scale / pan.scale, 1 / scale / pan.scale);
  ctx.translate(-pos.x, -pos.y);
}

export function drawCursor(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  direction: boolean,
  variant: boolean,
  pan: Pan,
) {
  drawCursor_(ctx, pos, direction, variant, '#fb923c', pan);
}
