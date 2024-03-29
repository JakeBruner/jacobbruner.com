// import "/src/routes/elliptic-curve/index.svelte";

const mod = (a: number, n: number): number => {
  return ((a % n) + n) % n;
};

// Y^2 = X^3 + aX + b
// export let a = 4;
// export let b = 3;
// export let char = 7; // characteristic of the finite field

export const isPrime = function (n: number): boolean {
  // return true;
  if (mod(n, 2) === 0) {
    return false;
  }
  for (let d = 3; (d ^ 2) < n; d += 2) {
    if (mod(n, d) === 0) {
      return false;
    }
  }
  return true;
};

// this is some of the sexiest code ive written
// no its not you were lying to yourself.

export class FiniteField {
  readonly characteristic: number;
  readonly inverses: number[];
  readonly residues: number[];
  constructor(char: number) {
    if (!isPrime(char)) {
      throw new Error("not prime");
      return;
    }
    this.characteristic = char;

    const sqrt: number[] = [];
    const inv: number[] = []; //

    for (let i = 0; i < this.characteristic; i++) {
      sqrt[i] = -1;
    }

    for (let i = 0; i < this.characteristic; i++) {
      if (i < this.characteristic / 2) {
        // so i^2 is not > char
        sqrt[(i * i) % this.characteristic] = i; // computing quadratic residues
      }
      for (let j = i; j < this.characteristic; j++) {
        if ((i * j) % this.characteristic === 1) {
          // if i and j are inverse
          inv[i] = j; // write j as the i-th element of inv
          inv[j] = i; // write i as the j-th element of inv
          break;
        }
      }
    }
    this.inverses = inv;
    this.residues = sqrt;
  }

  getInv(n: number): number {
    return n >= this.characteristic ? this.inverses[n % this.characteristic] : this.inverses[n];
  }
}

// in form y^2 = x^3 + ax + b
//identity point as global
// const Id = new Point()

export class EllipticCurve extends FiniteField {
  readonly a: number;
  readonly b: number;
  readonly points: Point[];
  constructor(a: number, b: number, p: number) {
    super(p);
    this.a = a;
    this.b = b;
    this.points = this.kRationalPoints;
  }

  get kRationalPoints(): Point[] {
    const points: Point[] = [];
    points.push(new Point(this)); // identity
    for (let i = 0; i < this.characteristic; i++) {
      for (let j = 0; j <= this.characteristic / 2; j++) {
        if (
          j ** 2 % this.characteristic ===
          mod(i ** 3 + this.a * i + this.b, this.characteristic)
        ) {
          points.push(new Point(this, i, j));
          if (j % this.characteristic !== (this.characteristic - j) % this.characteristic) {
            points.push(new Point(this, i, this.characteristic - j));
          }
        }
      }
    }
    return points;
  }

  get getCayleyTable(): Point[][] {
    const table: Point[][] = [[new Point(this)]]; // not technically the identity element
    // note that constructing the table is O(n^2)
    // also note const still allows for array mutation

    const len = this.points.length;

    for (let i = 0; i < len; i++) {
      // this sweeps thru the first header column
      // matrix in form [A]_{i,j}
      // init len+1 by len+1 col??-major matrix\
      table[i + 1] = [this.points[i], this.points[i]];
    }

    for (let j = 0; j < len; j++) {
      table[0][j + 1] = this.points[j];
      table[1][j + 1] = this.points[j];
    }

    // * computing the rest of the points
    const len1 = len + 1;
    for (let i = 2; i < len1; i++) {
      // i goes down a column
      // table[i][2] = table[i][0].plus(table[0][2]);
      // console.log(table[i][0], " table i 0");
      // console.log(table[0][2], " table 0 2");
      for (let j = i; j < len1; j++) {
        table[i][j] = this.points[i - 1].plus(this.points[j - 1]);
        table[j][i] = table[i][j]; // symmetric about diagonal
      }
    }
    // table[2][4] = this.points[0];
    return table;
  }
}

export const hsl2hex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// this is a hacky way to get this to work
// why did I make Point inherit a private curve....
export class RawPoint {
  public x: number;
  public y: number;
  constructor(x = -1, y = -1) {
    this.x = x;
    this.y = y;
  }

  get isIdentity(): boolean {
    return this.x == -1 && this.y == -1;
  }

  get isNull(): boolean {
    return this.x !== this.x;
  }

  rawequals(p: RawPoint): boolean {
    return p.x == this.x && p.y == this.y;
  }

  get formatted(): string {
    return this.isIdentity ? " ∞ " : `(${this.x}, ${this.y})`;
  }
}

//! currently each Point contains all the context of the curve and field.
//! This is likely unnessecary and memory-heavy
export class Point extends RawPoint {
  private _curve: EllipticCurve; //! this was a mistake
  //TODO rewrite this
  // i need this so .plus() can be a method on class Point
  // this allows Point to pass the monad context of the underlying curve under it's methods that make new Points

  constructor(curve: EllipticCurve, x = -1, y = -1) {
    // identity element by default
    super(x, y);
    this._curve = curve;
    // note this doesn't check if x,y are reduced mod p
  }

  get getIndex(): number {
    return this._curve.points.findIndex((e) => e.x === this.x && e.y === this.y);
  }

  equals(p: Point): boolean {
    return p.x == this.x && p.y == this.y;
  }

  plus(p: Point): Point {
    if (this.isIdentity) return p;
    if (p.isIdentity) return this;

    if (this._curve !== p._curve) {
      throw new Error();
    }

    let m: number;
    if (this.x == p.x) {
      // if x-coords equal
      // * CASE 1: points are additive inverses
      if (this.y !== p.y || (this.y || p.y) === 0) {
        return new Point(this._curve);
        // * return the identity
      }
      // * CASE 2: points are equal
      // from implicit differentiation we get the tangent:
      // m = \frac{3x^2 + a}{2y} \mod field.characteristic
      // console.log(this.formatted, " + ", p.formatted);
      // console.log(this._curve.inverses, "inverses");
      // console.log(2 * this.y, "2*thisy");
      // console.log(this._curve.getInv(2 * this.y), "2*thisy inverse");
      // console.log(
      //   (2 * this.y * this._curve.getInv(2 * this.y)) % this._curve.characteristic,
      //   "result of multiplication"
      // );

      // m = \frac{3x^2 + a}{2y}
      m = mod(
        mod(3 * this.x * this.x + this._curve.a, this._curve.characteristic) *
          this._curve.getInv(2 * this.y),
        this._curve.characteristic
      );
    } else {
      // * Points are different, so we draw secant thru them
      // m = \frac{py - qy}{px - qx} \mod field.characteristic
      m = mod((p.y - this.y) * this._curve.getInv(p.x - this.x), this._curve.characteristic);
    }
    // xr = \frac{m^2 - px - qx}{2*py} \mod field.characteristic
    const xr = mod(m * m - p.x - this.x, this._curve.characteristic);
    const yr = mod(-(this.y + m * (xr - this.x)), this._curve.characteristic);
    return new Point(this._curve, xr, yr);
  }

  repeatedAddition(n: number): Point {
    if (n > 1) {
      return this.plus(this.repeatedAddition(n - 1));
    } else if (n == 1) {
      return this; // base case is P^1 = P
    } else if (n == 0) {
      return new Point(this._curve); // P^0 = Id
    } else {
      throw new Error("pls specify a positive exponent");
    }
  }

  get getRawPoint(): RawPoint {
    return new RawPoint(this.x, this.y);
  }

  // i dont knwo what the fuck a generator function is
  // subgroupGenerator = function*() {
  //   let elem: Point = this;
  //   do {
  //     elem = elem.repeatedAddition(2)
  //     yield elem;
  //   } while (!elem.isIdentity)
  //   return elem

  // }
}

export const getSubgroup = (point: RawPoint, curve: EllipticCurve): RawPoint[] => {
  const subgroup: RawPoint[] = [point];
  // console.log(subgroup);

  if (!(curve instanceof EllipticCurve)) {
    console.log("something went wrong");
    return [];
  }
  // this is how this should have been implemented in the first place...
  // for now its just a helper function in thise local scope
  // should probably be a method on EllipticCurve
  const plus = (P: RawPoint, Q: RawPoint): RawPoint => {
    let m: number;

    if (P.isIdentity || Q.isIdentity) {
      return new RawPoint();
    }

    if (P.x == Q.x) {
      // if x-coords equal
      //* CASE 1: points are additive inverses
      if (P.y !== Q.y || (P.y || Q.y) === 0) {
        return new RawPoint();
        //* return the identity
      }

      //* CASE 2: points are equal
      // from implicit differentiation we get the tangent:
      // m = \frac{3x^2 + a}{2y} \mod curve.characteristic
      m = mod(
        // I use P here but Q would work too
        mod(3 * P.x ** 2 + curve.a, curve.characteristic) * curve.getInv(2 * P.y),
        curve.characteristic
      );
      // console.log("x coordinates equal");
    } else {
      //* Points are different, so we draw secant thru them
      // m = \frac{py - qy}{px - qx} \mod field.characteristic
      m = mod(
        mod(Q.y - P.y, curve.characteristic) * curve.getInv(mod(Q.x - P.x, curve.characteristic)),
        curve.characteristic
      );
    }
    // xr = \frac{m^2 - px - qx}{2*py} \mod field.characteristic
    const xr = mod(m * m - Q.x - P.x, curve.characteristic);
    const yr = mod(-(P.y + m * (xr - P.x)), curve.characteristic);
    // console.log(m, xr, yr);
    return new RawPoint(xr, yr);
  };

  // the order of an element in a finitely generated group must be finite => must wrap to Id
  while (!subgroup[subgroup.length - 1].isIdentity) {
    subgroup.push(plus(point, subgroup[subgroup.length - 1]));
    // console.log(subgroup);
    if (subgroup.length > 20) {
      break;
    }
  }
  return subgroup;
};

// //* helper function for the while loop above
// const checkUnique = (array: RawPoint[]): boolean => {
//   const len = array.length - 1;
//   for (let i = 0; i < len; i++) {
//     for (let j = 0; j < len; j++) {
//       if (i == j) {
//         break;
//       } else if (array[i].rawequals(array[j])) {
//         return false;
//       }
//     }
//   }
//   return true;
// };

export const getFactors = (num: number): number[] => {
  const half = num / 2 + 1;
  const factors = [];
  for (let i = 2; i < half; i++) {
    if (num % i === 0) {
      factors.push(i);
      // factors.push(num / i); this is unecessary
    }
  }
  // factors.sort(); this is unnecessary
  return factors;
};

// all my homies hate functional programming
// interface M<T> {

// }

// function unit<T>(value: T): M<T> {
//     // ...
// }

// function bind<T, U>(instance: M<T>, transform: (value: T) => M<U>): M<U> {
//     // ...
// }

// const pointa = new Point();
// const pointb = new Point(1, 1);
// console.log(pointb);
// const sum = pointa.plus(pointb);
// console.log(sum);
// const product = pointb.repeatedAddition(5);
// console.log(product);
// // const gen = pointb.subgroupGenerator();
// for (let i = 0; i < 10; i++) {
//   // console.log(gen.next().value);
// }
// console.log(pointb);
// console.log(pointb.repeatedAddition(2));
// console.log(field.inverses);
// // console.log(sqrt);
