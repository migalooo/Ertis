export function createCanvas(width = 1, height = 1) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  return {
    canvas,
    ctx
  };
}
