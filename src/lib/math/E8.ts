/* eslint-disable @typescript-eslint/no-unused-vars */
import { sqdist, dotprod, sqnorm, octionionProduct } from "./vectorUtils";
import {
  identityMatrix,
  matrixProduct,
  transpose,
  scalarMultiple,
  matrixMultiProduct
} from "./matrixUtils";

const TAU = 2 * Math.PI;
const PHI = 1.618033988749894;

interface E8Lattice {
  ctx: CanvasRenderingContext2D;

  readonly roots: number[][];
  rootsZIndex: Float32Array;
  edges: number[];

  readonly initialProjectionMatrix: number[][];
  projectionMatrix: number[][];

  G2Conjugator: number[][];

  readonly E8toOctionionMatrix: number[][];

  E8toOctionionsConjugated: number[][];
  E8toOctionionsConjugatedInverse: number[][];

  rootProjections: Float32Array | null;

  rootColors: string[];
  rootZOrder: number[] | null;

  isRunning: boolean;
  animationStart: number | null;
  timeBase: number;
  drawLinesOn: boolean;
  drawPointsOn: boolean;
  darkmode: boolean;
  radiansRotated: number;

  // initialization functions
  createRoots: () => void;
  createEdges: (roots: number[][]) => void;
  computeRootColors: () => void;
  initializeMatrices: (randomConjugator: boolean) => void;

  // helper functions
  orthonormalize: (matrix: number[][], comparisonIndicies?: number[][]) => number[][];

  storedGaussianComputation: number | null;
  generateGaussian: () => number;

  generateGaussianVector: (dim: number) => number[];

  generateRandomG2Matrix: () => number[][];

  // animation functions
  compute8DRotationMatrix: (rad: number) => number[][];
  computeProjectionMatrix: (rad: number) => void;
  computeRootProjections: () => void;
  drawPoints: () => void;
  drawLines: () => void;
  computeAndDraw: (rad: number) => void;
  draw: (time: number) => void;

  // event handlers
  // handleResize: () => void;

  // stopAnimation: () => void;
  // startAnimation: () => void;

  // handledarkmode: () => void;
}

//! stop here to keep your sanity

export type E8LatticeConstructor = {
  ctx: CanvasRenderingContext2D;
  darkmode: boolean;
  scalefactor: number;
  showPoints: boolean;
  showLines: boolean;
  randomConjugator: boolean;
};

export default class E8 {
  ctx: CanvasRenderingContext2D;

  private readonly roots: number[][];
  private rootsZIndex!: Float32Array;
  private edges: number[];

  readonly initialProjectionMatrix: number[][];

  private projectionMatrix!: number[][];

  private G2Conjugator!: number[][];

  private E8toOctionionsConjugated!: number[][];
  private E8toOctionionsConjugatedInverse!: number[][];

  // converts an E8 vector to an octonion,
  // as in: 1 + i + j + k + ij + ik + jk + ijk
  readonly E8toOctionionMatrix = [
    [1 / 2, 0, 0, 0, 1 / 2, 0, 0, 0],
    [0, 1 / 2, 0, 0, 0, -1 / 2, 0, 0],
    [0, 0, 1 / 2, 0, 0, 0, -1 / 2, 0],
    [0, 0, 0, 1 / 2, 0, 0, 0, -1 / 2],
    [-1 / 2, 0, 0, 0, 1 / 2, 0, 0, 0],
    [0, 1 / 2, 0, 0, 0, 1 / 2, 0, 0],
    [0, 0, 1 / 2, 0, 0, 0, 1 / 2, 0],
    [0, 0, 0, 1 / 2, 0, 0, 0, 1 / 2]
  ];

  private rootProjections!: Float32Array | null;

  private rootColors!: string[];
  private rootZOrder!: number[] | null;

  private storedGaussianComputation: number | null = null;

  width: number;
  height: number;
  sf: number;

  isRunning: boolean;
  animationStart: number | null;
  timeBase = 0;
  drawLinesOn: boolean;
  drawPointsOn!: boolean;
  darkmode: boolean;
  radiansRotated = 0;

  private createRoots = () => {
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
        rootSecondKind(
          !!(i & 1),
          !!(i & 2),
          !!(i & 4),
          !!(i & 8),
          !!(i & 16),
          !!(i & 32),
          !!(i & 64)
        )
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

  private createEdges = (roots: number[][]) => {
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

  // using gram-schmidt
  private orthonormalize = (matrix: number[][], comparisonIndicies?: number[][]) => {
    if (!comparisonIndicies) {
      comparisonIndicies = new Array(matrix.length);
      for (let k = 0; k < matrix.length; k++) {
        comparisonIndicies[k] = new Array(k);
        // fill the array with the indices 0 to k-1
        for (let l = 0; l < k; l++) comparisonIndicies[k][l] = l;
      }
    }

    for (let k = 0; k < comparisonIndicies.length; k++) {
      let d;
      for (let l = 0; l < comparisonIndicies[k].length; l++) {
        // get the index of the current element in comparisonIndicies[k]
        const k2 = comparisonIndicies[k][l];
        // calculate the dot product of matrix[k] and matrix[k2]
        d = dotprod(matrix[k], matrix[k2]);
        // subtract d * matrix[k2] from matrix[k]
        for (let i = 0; i < matrix[k].length; i++) matrix[k][i] -= d * matrix[k2][i];
      }
      // calculate the square root of the square norm of matrix[k]
      d = Math.sqrt(sqnorm(matrix[k]));
      // divide each element in matrix[k] by d
      for (let i = 0; i < matrix[k].length; i++) matrix[k][i] /= d;
    }

    return matrix;
  };

  private generateGaussian = (): number => {
    // box-muller
    if (this.storedGaussianComputation === null) {
      const u0 = Math.random();
      const u1 = Math.random();
      this.storedGaussianComputation = Math.sqrt(-2 * Math.log(u0)) * Math.cos(TAU * u1);
      return Math.sqrt(-2 * Math.log(u0)) * Math.sin(TAU * u1);
    } else {
      const ret = this.storedGaussianComputation;
      this.storedGaussianComputation = null;
      return ret;
    }
  };

  private generateGaussianVector = (dim: number): number[] => {
    const vec = new Array(dim);
    for (let i = 0; i < dim; i++) vec[i] = this.generateGaussian();
    return vec;
  };

  /**
   * returns a random element of the G2 group, a subgroup of the octionion algebra.
   * Specifically, it is a 14-dimensional subgroup of the automorphism group of octionion algebra.
   * This is isomorphic to the group of rotations in 8-dimensional space.
   */
  private generateRandomG2Matrix = () => {
    let mat = new Array(8);

    // The first row is the identity matrix
    mat[0] = [1, 0, 0, 0, 0, 0, 0, 0];

    // The second and third rows are random vectors with a zero in the first position
    mat[1] = this.generateGaussianVector(8);
    mat[1][0] = 0;
    mat[2] = this.generateGaussianVector(8);
    mat[2][0] = 0;

    // make the first three rows orthogonal and of unit length
    mat = this.orthonormalize(mat, [[], [0], [0, 1]]);

    // fourth row is the octionion product of the second and third rows
    mat[3] = octionionProduct(mat[1], mat[2]);

    // fifth row is a random vector with a zero in the first position
    mat[4] = this.generateGaussianVector(8);
    mat[4][0] = 0;

    // make the first five rows orthogonal and of unit length
    mat = this.orthonormalize(mat, [[], [], [], [], [0, 1, 2, 3]]);

    // The sixth, seventh, and eighth rows are the octionion products of the other rows with the fifth row
    mat[5] = octionionProduct(mat[1], mat[4]);
    mat[6] = octionionProduct(mat[2], mat[4]);
    mat[7] = octionionProduct(mat[3], mat[4]);

    // this should be unnecessary, since the first five rows are already orthogonal and of unit length
    mat = this.orthonormalize(mat);

    return mat;
  };

  private initializeMatrices = (randomConjugator: boolean) => {
    // If standard is true, set conjugator to the identity matrix.
    // Otherwise a random element of the G2 group.
    if (!randomConjugator) this.G2Conjugator = identityMatrix(8);
    else this.G2Conjugator = this.generateRandomG2Matrix();

    // G2conjugatorT = transpose(this.G2Conjugator);

    this.E8toOctionionsConjugated = matrixProduct(this.E8toOctionionMatrix, this.G2Conjugator);

    this.E8toOctionionsConjugatedInverse = scalarMultiple(
      transpose(this.E8toOctionionsConjugated),
      2
    );
  };

  //* rendering functions

  private compute8DRotationMatrix = (rad: number) => {
    rad = rad / 4;
    const ca = Math.cos(rad);

    const sa = Math.sin(rad);

    const cb = Math.cos(PHI * rad);

    const sb = Math.sin(PHI * rad);

    const c2b = Math.cos(2 * PHI * rad);

    const s2b = Math.sin(2 * PHI * rad);
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

  private computeProjectionMatrix = (rad: number) => {
    // P = P0 * G2 * T * G2^-1
    this.projectionMatrix = matrixMultiProduct(
      this.initialProjectionMatrix,
      this.E8toOctionionsConjugated,
      this.compute8DRotationMatrix(rad),
      this.E8toOctionionsConjugatedInverse
    );
  };

  private computeRootProjections = () => {
    if (!this.rootProjections) {
      this.rootProjections = new Float32Array(this.roots.length * 2);
      this.rootsZIndex = new Float32Array(this.roots.length);
    }
    // project the roots from 8D to 2D :)
    const len = this.roots.length;
    for (let n = 0; n < len; n++) {
      // maximum magnitude of the root is  sqrt(8) = 2.828427
      this.rootProjections[2 * n] =
        dotprod(this.projectionMatrix[0], this.roots[n]) * this.sf + this.width / 2;
      this.rootProjections[2 * n + 1] =
        dotprod(this.projectionMatrix[1], this.roots[n]) * this.sf + this.height / 2;
      this.rootsZIndex[n] = dotprod(this.projectionMatrix[2], this.roots[n]);
    }
  };

  private computeRootColors = (/** darkmode: boolean */) => {
    // const rootColorArray: [number, number, number][] = [];
    // [hue, saturation, value]
    this.rootColors = new Array<string>(this.roots.length);
    const len = this.roots.length;
    for (let n = 0; n < len; n++) {
      // maximum magnitude of the root is  sqrt(8) = 2.82842712475
      const x = dotprod(this.initialProjectionMatrix[0], this.roots[n]) / 2.83;
      const y = dotprod(this.initialProjectionMatrix[1], this.roots[n]) / 2.83;

      const hue = Math.atan2(-y, x) / TAU + 0.5;

      const sat = Math.sqrt(x * x + y * y) * 0.9 + 0.3;

      // darkmode logic goes here! eventually
      this.rootColors[n] = hsvToRgbString(hue, sat, this.darkmode ? 0.7 : 0.9);
    }
  };

  private drawLines = () => {
    if (!this.rootProjections) return;
    // Draw the 6720 edges.

    for (let n = 0; n < this.edges.length / 2; n++) {
      const i = this.edges[2 * n];
      const j = this.edges[2 * n + 1];
      this.ctx.beginPath();
      this.ctx.moveTo(this.rootProjections[2 * i], this.rootProjections[2 * i + 1]);
      this.ctx.lineTo(this.rootProjections[2 * j], this.rootProjections[2 * j + 1]);
      this.ctx.stroke();
    }
  };

  private drawPoints = () => {
    if (!this.rootProjections) return;
    const len = this.roots.length;
    if (!this.rootZOrder) {
      this.rootZOrder = [];
      for (let k = 0; k < len; k++) {
        this.rootZOrder[k] = k;
      }
    }

    // Avoid sorting the rootZorder array on every frame.
    let zIndexChanged = false;
    for (let k = 0; k < len; k++) {
      if (this.rootsZIndex[k] !== this.rootsZIndex[k + 1]) {
        zIndexChanged = true;
        break;
      }
    }
    if (zIndexChanged) {
      this.rootZOrder.sort((k1, k2) => this.rootsZIndex[k1] - this.rootsZIndex[k2]);
    }

    for (let k = 0; k < len; k++) {
      const n = this.rootZOrder[k];
      this.ctx.fillStyle = this.rootColors[n];
      this.ctx.beginPath();
      this.ctx.arc(this.rootProjections[2 * n], this.rootProjections[2 * n + 1], 2, 0, TAU, true);
      // this.ctx.rect(this.rootProjections[2 * n] - 1, this.rootProjections[2 * n + 1] - 1, 2, 2);
      this.ctx.closePath();

      this.ctx.fill();
    }
  };

  private computeAndDraw = (rad: number) => {
    this.radiansRotated = rad;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.computeProjectionMatrix(rad);
    this.computeRootProjections();
    if (this.drawLinesOn) this.drawLines();
    if (this.drawPointsOn) this.drawPoints();
  };

  private draw = (time: number) => {
    if (!this.isRunning) return;
    if (!this.animationStart) this.animationStart = time;
    this.computeAndDraw((time - this.animationStart) / 1000 + this.timeBase);
    requestAnimationFrame(this.draw);
  };

  constructor({
    ctx,
    darkmode,
    scalefactor,
    showLines,
    showPoints,
    randomConjugator
  }: E8LatticeConstructor) {
    this.ctx = ctx;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
    this.sf = scalefactor * 100;

    this.darkmode = darkmode;

    this.ctx.lineWidth = 0.1;
    this.ctx.strokeStyle = this.darkmode ? "rgb(228,228,231)" : "rgb(63,63,70)";

    this.roots = this.createRoots();
    this.edges = this.createEdges(this.roots);

    this.initialProjectionMatrix = new Array(2);
    // this is the projection matrix defining the petri projection of E8, displaying it's beautiful 24-fold symmetry
    this.initialProjectionMatrix[0] = [
      0.580162190775135, 0.240311047795148, 0.424708200277867, 0.0, -0.580162190775135,
      0.240311047795148, 0.0, 0.175919896606161
    ];
    this.initialProjectionMatrix[1] = [
      0.580162190775135, 0.240311047795148, 0.0, 0.175919896606161, 0.580162190775135,
      -0.240311047795148, -0.424708200277867, 0.0
    ];
    this.initialProjectionMatrix[2] = [1, 0, 0, 0, 0, 0, 0, 0];

    // make initialProjectionMatrix normed and orthogonal.
    this.initialProjectionMatrix = this.orthonormalize(this.initialProjectionMatrix);

    // initialize the G2Conjugator and E8ToOctionionConjugated
    // true, so random seed is used
    this.initializeMatrices(true);
    this.computeRootColors();

    this.isRunning = true;
    this.animationStart = 0;
    this.timeBase = 0;
    this.radiansRotated = 0;
    this.drawLinesOn = showLines;
    this.drawPointsOn = showPoints;
    requestAnimationFrame(this.draw);
  }

  public stop = () => {
    this.isRunning = false;
    this.timeBase += this.radiansRotated;
  };

  public handleDarkmodeChange = (darkmode: boolean) => {
    this.darkmode = darkmode;
    this.ctx.strokeStyle = this.darkmode ? "rgb(228,228,231)" : "rgb(63,63,70)";
    this.computeRootColors();
  };
}

// range of inputs: 0-1
function hsvToRgbString(h: number, s: number, v: number) {
  const h_i = Math.floor(h * 6);
  const f = h * 6 - h_i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (h_i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
  }
  return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
}
