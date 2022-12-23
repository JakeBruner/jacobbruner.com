//TODO: eventaully ill see if some of these would be faster in rust
export const sqnorm = (a: number[]) => {
  let n = 0;
  for (let i = 0; i < 8; i++) {
    n += a[i] * a[i];
  }
  return n;
};

export const sqdist = (a: number[], b: number[]) => {
  let d = 0;
  for (let i = 0; i < 8; i++) {
    d += (a[i] - b[i]) * (a[i] - b[i]);
  }
  return d;
};

export const dotprod = (a: number[], b: number[]) => {
  let d = 0;
  for (let i = 0; i < 8; i++) {
    d += a[i] * b[i];
  }
  return d;
};

const octonionSignTab = [
  // Convention here is that:
  //   e3=e1*e2, e5=e1*e4, e6=e2*e4, e7=(e1*e2)*e4
  // 0   1   2   3   4   5   6   7
  [+1, +1, +1, +1, +1, +1, +1, +1], // 0
  [+1, -1, +1, -1, +1, -1, -1, +1], // 1
  [+1, -1, -1, +1, +1, +1, -1, -1], // 2
  [+1, +1, -1, -1, +1, -1, +1, -1], // 3
  [+1, -1, -1, -1, -1, +1, +1, +1], // 4
  [+1, +1, -1, +1, -1, -1, -1, +1], // 5
  [+1, +1, +1, -1, -1, +1, -1, -1], // 6
  [+1, -1, +1, +1, -1, -1, +1, -1] // 7
];

export const octonionProduct = (x: number[], y: number[]) => {
  // Multiply two octonions
  const z = new Array(8);
  for (let i = 0; i < 8; i++) z[i] = 0;
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) z[i ^ j] += octonionSignTab[i][j] * x[i] * y[j];
  return z;
};
