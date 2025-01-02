export const generateColor = (x, y) => {
  const r = Math.floor((x * y * 1234567) % 255);
  const g = Math.floor((x * y * 7654321) % 255);
  const b = Math.floor((x * y * 9876543) % 255);

  return `rgb(${r}, ${g}, ${b})`;
};
