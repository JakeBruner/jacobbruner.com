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

// const memoize = (fn: any) => {
//   const cache = new Map();
//   return (...args: any[]) => {
//     const key = JSON.stringify(args);
//     if (cache.has(key)) return cache.get(key);
//     const result = fn(...args);
//     cache.set(key, result);
//     return result;
//   };
// };

// but typesafe
// https://stackoverflow.com/questions/49927584/typescript-memoize-function
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

//TODO I could possibly use local storage to cache this

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
