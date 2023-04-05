import { TILE_SIZE } from '../lib/constants';
import { Position } from '../types/api';
import { BoardLetters, InventoryLetter } from '../types/board';
import { Pan } from '../types/canvas';
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

export function drawPlacedLetters(ctx: CanvasRenderingContext2D, placedLetters: BoardLetters, pan: Pan) {
  placedLetters.forEach((letter) => {
    const pos = worldToScreen(posCentered(letter.position), pan);
    ctx.fillStyle = 'black';
    // use scaled font size
    const fontSize = pan.scale * TILE_SIZE * 0.025;
    ctx.font = `${fontSize}px Arial`;
    const letterOffset = pan.scale * TILE_SIZE * 0.01;
    ctx.fillText(letter.letter, pos.x - letterOffset, pos.y + letterOffset);
  });
}

export function drawPlacedInventoryLetters(ctx: CanvasRenderingContext2D, placedLetters: InventoryLetter[], pan: Pan) {
  placedLetters.forEach((letter) => {
    if (!letter.position) return;
    const pos = worldToScreen(posCentered(letter.position), pan);
    ctx.fillStyle = 'black';
    // use scaled font size
    const fontSize = pan.scale * TILE_SIZE * 0.025;
    ctx.font = `${fontSize}px Arial`;
    const letterOffset = pan.scale * TILE_SIZE * 0.01;
    ctx.fillText(letter.letter, pos.x - letterOffset, pos.y + letterOffset);
  });
}
