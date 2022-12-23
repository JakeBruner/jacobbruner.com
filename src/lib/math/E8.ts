// declare global {
//   interface Array<T> {
//     /**
//      * Returns the squared norm of this vector.
//      * @returns The squared norm.
//     */
//     sqnorm(): number;
// }

import { sqdist, dotprod, sqnorm, octonionProduct } from "./vectorUtils";
import {
  identityMatrix,
  zeroMatrix,
  matrixProduct,
  transpose,
  scalarMultiple,
  matrixMultiProduct
} from "./matrixUtils";

const createEdges = (roots: number[][]) => {
  const _edges: number[] = [];
  for (let a = 0; a < roots.length; a++) {
    for (let b = a + 1; b < roots.length; b++) {
      if (sqdist(roots[a], roots[b]) === 8) {
        _edges.push(a);
        _edges.push(b);
      }
    }
  }
  // edges = new Uint16Array(_edges);
  return _edges;
};

const createRoots = () => {
  const roots: number[][] = [];
  function rootFirstKind(i0: number, i1: number, s0: boolean, s1: boolean) {
    const rt = [0, 0, 0, 0, 0, 0, 0, 0];
    rt[i0] = s0 ? -2 : 2;
    rt[i1] = s1 ? -2 : 2;
    return rt;
  }
  function rootSecondKind(...si: boolean[]): number[] {
    let s7 = false;
    const signs: number[] = [];
    for (let i = 0; i <= 6; i++) {
      s7 = s7 !== si[i];
      signs.push(si[i] ? -1 : 1);
    }
    signs.push(s7 ? -1 : 1);
    return signs;
  }
  for (let i0 = 0; i0 < 8; i0++) {
    for (let i1 = i0 + 1; i1 < 8; i1++) {
      roots.push(rootFirstKind(i0, i1, false, false));
      roots.push(rootFirstKind(i0, i1, false, true));
      roots.push(rootFirstKind(i0, i1, true, false));
      roots.push(rootFirstKind(i0, i1, true, true));
    }
  }
  for (let i = 0; i < 128; i++) {
    roots.push(
      rootSecondKind(!!(i & 1), !!(i & 2), !!(i & 4), !!(i & 8), !!(i & 16), !!(i & 32), !!(i & 64))
    );
  }
  roots.sort((a, b) => {
    // Lexicographic ordering
    for (let k = 0; k < 8; k++) {
      if (a[k] < b[k]) return -1;
      else if (a[k] > b[k]) return 1;
    }
    return 0;
  });
  return roots;
};

// Make matrix normed and orthogonal.
const gramSchmidt = (matrix: number[][], orthcond?: number[][]) => {
  if (!orthcond) {
    orthcond = new Array(matrix.length);
    for (let k = 0; k < matrix.length; k++) {
      // Create an array of length k for each element in orthcond.
      orthcond[k] = new Array(k);
      // Fill the array with the indices 0 to k-1.
      for (let l = 0; l < k; l++) orthcond[k][l] = l;
    }
  }

  for (let k = 0; k < orthcond.length; k++) {
    let d;
    for (let l = 0; l < orthcond[k].length; l++) {
      // Get the index of the current element in orthcond[k].
      const k2 = orthcond[k][l];
      // Calculate the dot product of matrix[k] and matrix[k2].
      d = dotprod(matrix[k], matrix[k2]);
      // Subtract d * matrix[k2] from matrix[k].
      for (let i = 0; i < matrix[k].length; i++) matrix[k][i] -= d * matrix[k2][i];
    }
    // Calculate the square root of the square norm of matrix[k].
    d = Math.sqrt(sqnorm(matrix[k]));
    // Divide each element in matrix[k] by d.
    for (let i = 0; i < matrix[k].length; i++) matrix[k][i] /= d;
  }

  return matrix;
};

let gaussianStore: number | null = null;

const gaussian = (): number => {
  // Generate a Gaussian variable by Box-Muller.
  if (gaussianStore === null) {
    const u0 = Math.random();
    const u1 = Math.random();
    gaussianStore = Math.sqrt(-2 * Math.log(u0)) * Math.cos(2 * Math.PI * u1);
    return Math.sqrt(-2 * Math.log(u0)) * Math.sin(2 * Math.PI * u1);
  } else {
    const ret = gaussianStore;
    gaussianStore = null;
    return ret;
  }
};

const gaussianVector = (dim: number): number[] => {
  const vec = new Array(dim);
  for (let i = 0; i < dim; i++) vec[i] = gaussian();
  return vec;
};

// const randomOrthogonalMatrix = (rows: number, cols: number) => {
//   const mat = new Array(rows);
//   for (let i = 0; i < rows; i++) mat[i] = gaussianVector(cols);
//   return gramSchmidt(mat);
// };

/**
 * this function returns a random element of the G2 group, a subgroup of the octonion algebra.
 * Specifically, it is a 14-dimensional subgroup of the automorphism group of octionion algebra.
 * This is isomorphic to the group of rotations in 8-dimensional space.
 */
// const randomG2Matrix = () => {
//   // Return a random element of the G2 group
//   // Initialize a matrix with 8 rows
//   let mat = new Array(8);

//   // The first row is the identity matrix
//   mat[0] = [1, 0, 0, 0, 0, 0, 0, 0];

//   // The second and third rows are random vectors with a zero in the first position
//   mat[1] = gaussianVector(8);
//   mat[1][0] = 0;
//   mat[2] = gaussianVector(8);
//   mat[2][0] = 0;

//   // Use the Gram-Schmidt process to make the first three rows orthogonal and of unit length
//   // Specifically, we want to make sure that mat[1] and mat[2] are orthogonal to mat[0], and that mat[2] is orthogonal to mat[1]
//   mat = gramSchmidt(mat, [[], [0], [0, 1]]);

//   // The fourth row is the octonion product of the second and third rows
//   mat[3] = octonionProduct(mat[1], mat[2]);

//   // The fifth row is a random vector with a zero in the first position
//   mat[4] = gaussianVector(8);
//   mat[4][0] = 0;

//   // Use the Gram-Schmidt process to make the first five rows orthogonal and of unit length
//   // Specifically, we want to make sure that mat[4] is orthogonal to mat[0], mat[1], mat[2], and mat[3]
//   mat = gramSchmidt(mat, [[], [], [], [], [0, 1, 2, 3]]);

//   // The sixth, seventh, and eighth rows are the octonion products of the other rows with the fifth row
//   mat[5] = octonionProduct(mat[1], mat[4]);
//   mat[6] = octonionProduct(mat[2], mat[4]);
//   mat[7] = octonionProduct(mat[3], mat[4]);

//   // Use the Gram-Schmidt process to make all eight rows orthogonal and of unit length
//   // In principle, this should be unnecessary, since the first five rows are already orthogonal and of unit length
//   mat = gramSchmidt(mat);

//   // Return the resulting matrix
//   return mat;
// };

const e8ToOctMat = [
  [1 / 2, 0, 0, 0, 1 / 2, 0, 0, 0],
  [0, 1 / 2, 0, 0, 0, -1 / 2, 0, 0],
  [0, 0, 1 / 2, 0, 0, 0, -1 / 2, 0],
  [0, 0, 0, 1 / 2, 0, 0, 0, -1 / 2],
  [-1 / 2, 0, 0, 0, 1 / 2, 0, 0, 0],
  [0, 1 / 2, 0, 0, 0, 1 / 2, 0, 0],
  [0, 0, 1 / 2, 0, 0, 0, 1 / 2, 0],
  [0, 0, 0, 1 / 2, 0, 0, 0, 1 / 2]
];

/**
 *
 * @param t Rotation angle in radians.
 * @returns A 8x8 matrix representing a simple rotation in 8-dimensional space.
 */
const torus8DRotationMatrix = (t: number) => {
  t = 0;
  // The golden ratio.
  const phi = 2;
  // Cosine of t.
  const ca = Math.cos(t);
  // Sine of t.
  const sa = Math.sin(t);
  // Cosine of phi * t.
  const cb = Math.cos(phi * t);
  // Sine of phi * t.
  const sb = Math.sin(phi * t);
  // Cosine of 2 * phi * t.
  const c2b = Math.cos(phi * 2 * t);
  // Sine of 2 * phi * t.
  const s2b = Math.sin(5 * phi * t);
  return [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, ca * cb, sa * cb, 0, 0, ca * sb, sa * sb, 0],
    [0, -sa * cb, ca * cb, 0, 0, -sa * sb, ca * sb, 0],
    [0, 0, 0, c2b, 0, 0, 0, -s2b],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, -ca * sb, -sa * sb, 0, 0, ca * cb, sa * cb, 0],
    [0, sa * sb, -ca * sb, 0, 0, -sa * cb, ca * cb, 0],
    [0, 0, 0, s2b, 0, 0, 0, c2b]
  ];
};

export const initE8 = (ctx: CanvasRenderingContext2D) => {
  const roots = createRoots();
  const edges = createEdges(roots);

  // The two 8-vectors determining the projection to a plane:
  // these should be normed and orthogonal.
  // A third vector is used to determine the (Z-index) order of the dots.
  let projMatrix0: number[][]; // At t=0
  let projMatrix: number[][]; // At t=1

  // The matrix representing the conjugation action on the E8 lattice.
  let conjugator;
  // The transpose of the conjugation matrix.
  let conjugatorT: number[][];

  // The matrix representing the transformation from the E8 lattice to the octonion algebra.
  let e8ToOctThenConjugator: number[][];
  // The inverse of the transformation matrix from the E8 lattice to the octonion algebra.
  let e8ToOctThenConjugatorInv: number[][];

  const initMatrices = (standard: boolean) => {
    // Set projMatrix0 to the initial projection matrix.
    projMatrix0 = new Array(2);
    projMatrix0[0] = [
      0.580162190775135, 0.240311047795148, 0.424708200277867, 0.0, -0.580162190775135,
      0.240311047795148, 0.0, 0.175919896606161
    ];
    projMatrix0[1] = [
      0.580162190775135, 0.240311047795148, 0.0, 0.175919896606161, 0.580162190775135,
      -0.240311047795148, -0.424708200277867, 0.0
    ];
    projMatrix0[2] = [1, 0, 0, 0, 0, 0, 0, 0];

    // Use Gram-Schmidt process to make projMatrix0 normed and orthogonal.
    gramSchmidt(projMatrix0);

    // If standard is true, set conjugator to the identity matrix.
    // Otherwise, set conjugator to a random element of the G2 group.
    if (standard) conjugator = identityMatrix(8);
    // else conjugator = randomG2Matrix();

    // Set conjugatorT to the transpose of conjugator.
    conjugatorT = transpose(conjugator);

    // Set e8ToOctThenConjugator to the result of transforming the E8 lattice
    // by the octonion algebra and then by the conjugation action.
    e8ToOctThenConjugator = matrixProduct(e8ToOctMat, conjugator);

    // Set e8ToOctThenConjugatorInv to the inverse of the transformation matrix
    // from the E8 lattice to the octonion algebra.
    e8ToOctThenConjugatorInv = scalarMultiple(transpose(e8ToOctThenConjugator), 2);
  };

  const computeProjectionMatrix = (time: number) => {
    // Calculate the matrix representing a rotation on the torus.
    const tMat = torus8DRotationMatrix(time);

    // Compute the projection matrix using the following steps:
    // 1. Multiply projMatrix0 by e8ToOctThenConjugator.
    // 2. Multiply the result by tMat.
    // 3. Multiply the result by e8ToOctThenConjugatorInv.
    projMatrix = matrixMultiProduct(
      projMatrix0,
      e8ToOctThenConjugator,
      tMat,
      e8ToOctThenConjugatorInv
    );
  };

  let rootProj: Float32Array | null = null; // Projection of the roots (in canvas coordinates)
  let rootZidx: Float32Array; // Z-index of the roots
  let rootColor: string[]; // Root colors (RGB coordinates)

  const computeRootProjections = () => {
    // closure
    if (!rootProj) {
      rootProj = new Float32Array(roots.length * 2);
      rootZidx = new Float32Array(roots.length);
    }
    for (let n = 0; n < roots.length; n++) {
      rootProj[2 * n] = dotprod(projMatrix[0], roots[n]) * 100 + 300;
      rootProj[2 * n + 1] = dotprod(projMatrix[1], roots[n]) * 100 + 300;
      rootZidx[n] = dotprod(projMatrix[2], roots[n]);
    }
  };

  const computeRootColors = () => {
    // closure
    rootColor = [];
    for (let n = 0; n < roots.length; n++) {
      // Calculate the hue value based on the projection of the root in the xy-plane
      const x = dotprod(projMatrix0[0], roots[n]) / 2.83;
      const y = dotprod(projMatrix0[1], roots[n]) / 2.83;
      const hue = (Math.atan2(-y, x) / Math.PI + 1) * 3;

      // Determine the RGB values based on the hue value
      let red, grn, blu;
      if (hue < 1) {
        red = 0;
        grn = 1;
        blu = hue;
      } else if (hue < 2) {
        red = 0;
        grn = 2 - hue;
        blu = 1;
      } else if (hue < 3) {
        red = hue - 2;
        grn = 0;
        blu = 1;
      } else if (hue < 4) {
        red = 1;
        grn = 0;
        blu = 4 - hue;
      } else if (hue < 5) {
        red = 1;
        grn = hue - 4;
        blu = 0;
      } else {
        red = 6 - hue;
        grn = 1;
        blu = 0;
      }

      // Adjust the saturation based on the distance of the root in the xy-plane
      const sat = Math.sqrt(x * x + y * y) * 0.9 + 0.1;
      red = sat * red + (1 - sat);
      grn = sat * grn + (1 - sat);
      blu = sat * blu + (1 - sat);

      // Convert the RGB values to integer values in the range [0, 255] and create the color string
      const col = [
        Math.floor(red * 255 + 0.5),
        Math.floor(grn * 255 + 0.5),
        Math.floor(blu * 255 + 0.5)
      ];
      rootColor[n] = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
    }
  };

  const drawLines = () => {
    if (!rootProj) return;
    // Draw the 6720 edges.
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = "rgb(0,0,0)";
    for (let n = 0; n < edges.length / 2; n++) {
      const i = edges[2 * n];
      const j = edges[2 * n + 1];
      ctx.beginPath();
      ctx.moveTo(rootProj[2 * i], rootProj[2 * i + 1]);
      ctx.lineTo(rootProj[2 * j], rootProj[2 * j + 1]);
      ctx.stroke();
    }
  };

  let rootZorder: number[] | undefined;

  const drawPoints = () => {
    if (!rootProj) return;
    // Draw points.
    if (!rootZorder) {
      rootZorder = new Array(roots.length);
      for (let k = 0; k < roots.length; k++) {
        rootZorder[k] = k;
      }
    }
    rootZorder.sort((k1, k2) => rootZidx[k1] - rootZidx[k2]);
    for (let k = 0; k < roots.length; k++) {
      const n = rootZorder[k];
      ctx.fillStyle = rootColor[n];
      ctx.beginPath();
      ctx.arc(rootProj[2 * n], rootProj[2 * n + 1], 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }
  };

  const initCanvas = () => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  let isRunning = false;
  let animationStart: number | null = null;
  let timeBase = 0;
  const drawLinesOn = true;

  const computeAndDraw = (time: number) => {
    ctx.clearRect(0, 0, 600, 600);
    computeProjectionMatrix(time);
    computeRootProjections();
    if (drawLinesOn) drawLines();

    drawPoints();
    // const elt = document.getElementById("time");
    // while (elt.firstChild) elt.removeChild(elt.firstChild);
    // elt.appendChild(document.createTextNode(time.toFixed(3)));
  };

  createRoots();
  initMatrices(false);
  initCanvas();
  computeRootColors();
  isRunning = true;

  const draw = (time: number) => {
    if (!isRunning) return;
    if (!animationStart) animationStart = time;
    computeAndDraw((time - animationStart) / 1000 + timeBase);
    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};
