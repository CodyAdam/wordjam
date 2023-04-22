import { TILE_PADDING, TILE_SIZE } from '../lib/constants';
import { Position } from '../types/api';
import { BoardLetters, Highlight, InventoryLetter } from '../types/board';
import { Pan } from '../types/canvas';
import { boardFont } from './fontLoader';
import { posFloor, screenToWorld, posCeil, worldToScreen, posCentered } from './posHelper';

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

export function drawPlacedLetters(
  ctx: CanvasRenderingContext2D,
  placedLetters: BoardLetters,
  pan: Pan,
  highlight: Highlight,
) {
  placedLetters.forEach((letter) => {
    if (!letter.position) return;

    ctx.fillStyle = 'rgb(63 63 70)';
    if (highlight && highlight.positions.some((pos) => pos.x === letter.position!.x && pos.y === letter.position!.y)) {
      ctx.fillStyle = highlight.color;
    }
    const pos = worldToScreen(posCentered(letter.position), pan);

    // // Create the tile background
    // ctx.beginPath();
    // ctx.fillStyle = '#e2e8f0';
    // const padding = 0.05 * pan.scale;
    // ctx.roundRect(
    //   pos.x + padding,
    //   pos.y - pan.scale + padding,
    //   pan.scale - padding * 2,
    //   pan.scale - padding * 2,
    //   0.15 * pan.scale, // rounded radius
    // );
    // ctx.fill();

    // use scaled font size
    const fontSize = pan.scale * TILE_SIZE * 0.035;
    ctx.font = `${fontSize}px ${boardFont.style.fontFamily}`;

    // offset by .5 of the letter width to center it same for height
    const letterOffset = { x: ctx.measureText(letter.letter.toUpperCase()).width / 2, y: fontSize / 2.9 };

    ctx.fillText(letter.letter.toUpperCase(), pos.x - letterOffset.x, pos.y + letterOffset.y);
  });
}

export function drawPlacedInventoryLetters(
  ctx: CanvasRenderingContext2D,
  placedLetters: InventoryLetter[],
  pan: Pan,
  highlight: Highlight,
) {
  placedLetters.forEach((letter) => {
    if (!letter.position) return;
    
    ctx.fillStyle = '#60a5fa';
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
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
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
