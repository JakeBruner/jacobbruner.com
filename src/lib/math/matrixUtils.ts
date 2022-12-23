/* eslint-disable @typescript-eslint/no-explicit-any */
export const zeroMatrix = (rows: number, cols: number) => {
  const mat = new Array(rows);
  for (let i = 0; i < rows; i++) {
    mat[i] = new Array(cols);
    for (let j = 0; j < cols; j++) mat[i][j] = 0;
  }
  return mat;
};

export const identityMatrix = (size: number) => {
  const mat = new Array(size);
  for (let i = 0; i < size; i++) {
    mat[i] = new Array(size);
    for (let j = 0; j < size; j++) mat[i][j] = i == j ? 1 : 0;
  }
  return mat;
};

const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// memoized matrix product
const memoizedMatrixProduct = memoize((a: number[][], b: number[][]) => {
  const c = zeroMatrix(a.length, b[0].length);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < b.length; k++) {
        c[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return c;
});
export const matrixProduct = memoizedMatrixProduct;

export const matrixMultiProduct = (...matrices: number[][][]) => {
  let product = matrices[0];
  for (let i = 1; i < matrices.length; i++) {
    product = matrixProduct(product, matrices[i]);
  }
  return product;
};

export const transpose = (m: number[][]) => {
  // Return transpose of a matrix
  const cols = m.length;
  const rows = m[0].length;
  const m2 = new Array(rows);
  for (let i = 0; i < rows; i++) {
    m2[i] = new Array(cols);
    for (let j = 0; j < cols; j++) m2[i][j] = m[j][i];
  }
  return m2;
};

/**
 * @param m matrix
 * @param t scalar
 * @returns scalar multiple of matrix
 */
export const scalarMultiple = (m: number[][], t: number) => {
  const rows = m.length;
  const cols = m[0].length;
  const m2 = new Array(rows);
  for (let i = 0; i < rows; i++) {
    m2[i] = new Array(cols);
    for (let j = 0; j < cols; j++) m2[i][j] = m[i][j] * t;
  }
  return m2;
};

export const determinant = (m: number[][]) => {
  // Return determinant of a matrix
  if (m.length == 1) return m[0][0];
  if (m.length == 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let det = 0;
  for (let i = 0; i < m.length; i++) {
    det += m[0][i] * determinant(minor(m, 0, i));
  }
  return det;
};

const minor = (m: number[][], row: number, col: number) => {
  const m2 = new Array(m.length - 1);
  for (let i = 0; i < m.length; i++) {
    if (i == row) continue;
    m2[i < row ? i : i - 1] = new Array(m.length - 1);
    for (let j = 0; j < m.length; j++) {
      if (j == col) continue;
      m2[i < row ? i : i - 1][j < col ? j : j - 1] = m[i][j];
    }
  }
  return m2;
};
