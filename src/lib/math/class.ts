import { sqdist, dotprod, sqnorm, octonionProduct } from "./vectorUtils";
import {
  identityMatrix,
  matrixProduct,
  transpose,
  scalarMultiple,
  matrixMultiProduct
} from "./matrixUtils";

interface E8 {
  ctx: CanvasRenderingContext2D;

  roots: number[];
  edges: number[];

  readonly initialProjectionMatrix: number[][];
  projectionMatrix: number[][];

  readonly randomG2Conjugator: number[][];

  readonly e8toOctionionMatrix: number[][];

  rootProjection: Float32Array | null;
  edgeProjection: Float32Array | null;

  readonly rootColors: string[];
  rootZOrder: number[] | null;

  isRunning: boolean;
  animationStart: number | null;
  timeBase: number | null;
  drawLinesOn: boolean;
  drawPointsOn: boolean;
  darkMode: boolean;

  // initialization functions
  createRoots: () => void;
  createEdges: (roots: number[][]) => void;
  computeRootColors: () => void;
  initializeMatrices: () => void;

  // helper functions
  orthonormalize: (matrix: number[][], comparisonIndicies?: number[][]) => number[][];

  gaussianComputation: number | null;
  generateGaussian: () => number;

  generateGaussianVector: (dim: number) => number[];

  randomG2Matrix: () => number[][];

  // animation functions
  rotationMatrix: (rad: number) => number[][];

  computeProjectionMatrix: (rad: number) => number[][];
  computeRootProjections: () => void;
  drawPoints: () => void;
  drawLines: () => void;
  computeAndDraw: (rad: number) => void;
  draw: (time: number) => void;

  // event handlers
  // handleResize: () => void;

  // stopAnimation: () => void;
  // startAnimation: () => void;

  // handleDarkMode: () => void;
}

// export default class E8 {
//

// }
