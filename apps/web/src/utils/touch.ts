export function getMousePos(e: React.TouchEvent | React.MouseEvent) {
  let x = 0;
  let y = 0;
  e.stopPropagation();
  if (e.nativeEvent instanceof TouchEvent) {
    if (e.nativeEvent.touches.length === 0) return;
    x = e.nativeEvent.touches[0].clientX;
    y = e.nativeEvent.touches[0].clientY;
  } else if (e.nativeEvent instanceof MouseEvent) {
    e.preventDefault();
    x = e.nativeEvent.clientX;
    y = e.nativeEvent.clientY;
  } else {
    return;
  }
  return { x, y };
}