// declare global {
//   interface Array<T> {
//     /**
//      * Returns the squared norm of this vector.
//      * @returns The squared norm.
//     */
//     sqnorm(): number;
// }

const sqdist = (a: number[], b: number[]) => {
  let d = 0;
  for (let i = 0; i < 8; i++) {
    d += (a[i] - b[i]) * (a[i] - b[i]);
  }
  return d;
};

function createEdges(roots: number[][]) {
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
}
function createRoots() {
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
}

export const initE8 = (ctx: CanvasRenderingContext2D) => {
  let roots: number[][] = [];
  let edges: Uint16Array;
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;
  const scale = 0.5 * Math.min(width, height);
  const center = [0.5 * width, 0.5 * height];
  const origin = [0, 0, 0, 0, 0, 0, 0, 0];
  const basis: number[][] = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1]
  ];

  const init = () => {
    roots = createRoots();
    edges = new Uint16Array(createEdges(roots));
  };
  console.log("init");
  init();

  const colors = ["red", "green", "blue", "yellow", "cyan", "magenta", "orange", "purple"];
  const color = (a: number[]) => {
    for (let i = 0; i < 8; i++) {
      if (a[i] !== 0) {
        return colors[i];
      }
    }
    return "black";
  };
  const draw = (a: number[]) => {
    const p = project(a);
    ctx.beginPath();
    ctx.arc(p[0], p[1], 2, 0, 2 * Math.PI);
    ctx.fillStyle = color(a);
    ctx.fill();
  };
  const drawLine = (a: number[], b: number[]) => {
    const p = project(a);
    const q = project(b);
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.strokeStyle = color(a);
    ctx.stroke();
  };
  const project = (a: number[]) => {
    const p = [0, 0];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 8; j++) {
        p[i] += a[j] * basis[j][i];
      }
    }
    p[0] *= scale;
    p[1] *= scale;
    p[0] += center[0];
    p[1] += center[1];
    return p;
  };
  const drawBasis = () => {
    for (let i = 0; i < 8; i++) {
      drawLine(origin, basis[i]);
    }
  };
  const drawRoots = () => {
    for (let i = 0; i < roots.length; i++) {
      draw(roots[i]);
    }
  };
  const drawEdges = () => {
    for (let i = 0; i < edges.length; i += 2) {
      drawLine(roots[edges[i]], roots[edges[i + 1]]);
    }
  };
  const drawAll = () => {
    ctx.clearRect(0, 0, width, height);
    drawBasis();
    drawRoots();
    drawEdges();
  };
  const drawAllDebounced = debounce(drawAll, 100);
  // q: what does the debounce function do?

  window.addEventListener("resize", drawAllDebounced);
  drawAll();
};

const debounce = (func: () => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
};

// Array.prototype.sqnorm = function () {
//   let ret = 0;
//   for (let i = 0; i < this.length; i++) {
//     const d = this[i];
//     ret += d * d;
//   }
//   return ret;
// };

// const dotprod = (a: number[], b: number[]) => {
//   let ret = 0;
//   for (let i = 0; i < a.length; i++) {
//     ret += a[i] * b[i];
//   }
//   return ret;
// };

// function sqdist(a: number[], b: number[]) {
//   let ret = 0;
//   for (let i = 0; i < a.length; i++) {
//     const d = a[i] - b[i];
//     ret += d * d;
//   }
//   return ret;
// }

// function rotate(a: number[]) {
//   const b = [0, 0, 0, 0, 0, 0, 0, 0];
//   for (let i = 0; i < 8; i++) {
//     let sum = 0;
//     for (let j = 0; j < 8; j++) {
//       sum += a[j] * rot[i][j];
//     }
//     b[i] = sum;
//   }
//   return b;
// }

// // Rotation matrix for the quaternion group:

// // prettier-ignore
// const rot = [
//   [1, 0, 0, 0, 0, 0, 0, 0],
//   [0, 1, 0, 0, 0, 0, 0, 0],
//   [0, 0, 1, 0, 0, 0, 0, 0],
//   [0, 0, 0, 1, 0, 0, 0, 0],
//   [0, 0, 0, 0, 1, 0, 0, 0],
//   [0, 0, 0, 0, 0, 1, 0, 0],
//   [0, 0, 0, 0, 0, 0, 1, 0],
//   [0, 0, 0, 0, 0, 0, 0, 1]
// ];

// function draw() {
//   const canvas = document.getElementById("canvas") as HTMLCanvasElement;
//   const ctx = canvas.getContext("2d")!; //TODO
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.save();
//   ctx.translate(canvas.width / 2, canvas.height / 2);
//   ctx.scale(canvas.width / 10, -canvas.width / 10);
//   ctx.lineWidth = 0.1;
//   ctx.strokeStyle = "black";
//   ctx.beginPath();
//   for (let i = 0; i < edges.length; i += 2) {
//     const a = roots[edges[i]];
//     const b = roots[edges[i + 1]];
//     ctx.moveTo(a[0], a[1]);
//     ctx.lineTo(b[0], b[1]);
//   }
//   ctx.stroke();
//   ctx.fillStyle = "black";
//   ctx.beginPath();
//   for (let i = 0; i < roots.length; i++) {
//     const a = rotate(roots[i]);
//     ctx.moveTo(a[0] + 0.2, a[1] + 0.2);
//     ctx.arc(a[0], a[1], 0.2, 0, 2 * Math.PI);
//   }
//   ctx.fill();
//   ctx.restore();
//   requestAnimationFrame(draw);
// }

// requestAnimationFrame(draw);

// class E8Lattice {
//   private readonly roots: number[][];
//   private edges!: Uint16Array;
//   private gaussianStore: number | null = null;

//   constructor() {
//     this.roots = [];
//   }

//   private rootFirstKind(i0: number, i1: number, s0: boolean, s1: boolean): number[] {
//     const rt = [0, 0, 0, 0, 0, 0, 0, 0];
//     rt[i0] = s0 ? -2 : 2;
//     rt[i1] = s1 ? -2 : 2;
//     return rt;
//   }

//   private rootSecondKind(...si: boolean[]): number[] {
//     let s7 = false;
//     const signs = [];
//     for (let i = 0; i <= 6; i++) {
//       s7 = s7 !== si[i];
//       signs.push(si[i] ? -1 : 1);
//     }
//     signs.push(s7 ? -1 : 1);
//     return signs;
//   }

//   private createRoots(): void {
//     for (let i0 = 0; i0 < 8; i0++) {
//       for (let i1 = i0 + 1; i1 < 8; i1++) {
//         this.roots.push(this.rootFirstKind(i0, i1, false, false));
//         this.roots.push(this.rootFirstKind(i0, i1, false, true));
//         this.roots.push(this.rootFirstKind(i0, i1, true, false));
//         this.roots.push(this.rootFirstKind(i0, i1, true, true));
//       }
//     }
//     for (let i = 0; i < 128; i++) {
//       this.roots.push(
//         this.rootSecondKind(
//           !!(i & 1),
//           !!(i & 2),
//           !!(i & 4),
//           !!(i & 8),
//           !!(i & 16),
//           !!(i & 32),
//           !!(i & 64)
//         )
//       );
//     }
//     this.roots.sort(function (a, b) {
//       // Lexicographic ordering
//       for (let k = 0; k < 8; k++) {
//         if (a[k] < b[k]) return -1;
//         else if (a[k] > b[k]) return 1;
//       }
//       return 0;
//     });
//   }

//   private sqnorm(a: number[]): number {
//     let ret = 0;
//     for (let i = 0; i < a.length; i++) {
//       const d = a[i];
//       ret += d * d;
//     }
//     return ret;
//   }

//   private sqdist(a: number[], b: number[]): number {
//     let ret = 0;
//     for (let i = 0; i < a.length; i++) {
//       const d = a[i] - b[i];
//       ret += d * d;
//     }
//     return ret;
//   }

//   private dotprod(a: number[], b: number[]): number {
//     let ret = 0;
//     for (let i = 0; i < a.length; i++) {
//       ret += a[i] * b[i];
//     }
//     return ret;
//   }

//   private createEdges(): void {
//     const edges0 = [];
//     for (let a = 0; a < this.roots.length; a++) {
//       for (let b = a + 1; b < this.roots.length; b++) {
//         if (this.sqdist(this.roots[a], this.roots[b]) == 8) {
//           edges0.push(a);
//           edges0.push(b);
//         }
//       }
//     }
//   this.edges = new Uint16Array(edges0);
//   }

//   private gaussian(): number {
//     // Generate a Gaussian variable by Box-Muller.
//     if (this.gaussianStore !== null) {
//       const ret = this.gaussianStore;
//       this.gaussianStore = null;
//       return ret;
//     } else {
//       let u, v, s;
//       do {
//         u = Math.random() * 2 - 1;
//         v = Math.random() * 2 - 1;
//         s = u * u + v * v;
//       } while (s >= 1 || s == 0);
//       const fac = Math.sqrt((-2 * Math.log(s)) / s);
//       this.gaussianStore = v * fac;
//       return u * fac;
//     }
//   }

//   public init(): void {
//     this.createRoots();
//     this.createEdges();
//   }

//   public perturb(amplitude: number): void {
//     for (let i = 0; i < this.roots.length; i++) {
//       const r = this.roots[i];
//       const nr = this.sqnorm(r);
//       let scale;
//       if (nr == 0) scale = 1;
//       else if (nr == 8) scale = Math.sqrt(2);
//       else scale = Math.sqrt(8 / nr);
//       for (let k = 0; k < 8; k++) {
//         r[k] += this.gaussian() * amplitude * scale;
//       }
//     }
//   }

//   public project(projection: number[], center: number[]): number[][] {
//     const ret = [];
//     for (let i = 0; i < this.roots.length; i++) {
//       const r = this.roots[i];
//       const pr = [];
//       for (let k = 0; k < projection.length; k++) {
//         pr.push(this.dotprod(r, projection[k]) + center[k]);
//       }
//       ret.push(pr);
//     }
//     return ret;
//   }
// }
