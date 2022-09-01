// import "/src/routes/elliptic-curve/index.svelte";

const mod = (a: number, n: number): number => {
  return ((a % n) + n) % n;
};

// Y^2 = X^3 + aX + b
// export let a = 4;
// export let b = 3;
// export let char = 7; // characteristic of the finite field

const isPrime = function (n: number): boolean {
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

export class FiniteField {
  readonly characteristic: number;
  inverses: number[];
  residues: number[];
  constructor(char: number) {
    if (!isPrime(char)) {
      throw new Error("not prime");
      return;
    }
    this.characteristic = char;

    let sqrt: number[] = [];
    let inv: number[] = [];

    for (let i = 0; i < char; i++) {
      sqrt[i] = -1;
    }

    for (let i = 0; i < char; i++) {
      if (i <= char / 2) {
        // so i^2 is not > char
        sqrt[(i * i) % char] = i; // computing quadratic residues
      }
      for (let j = i; j < char; j++) {
        if ((i * j) % char == 1) {
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
}

// in form y^2 = x^3 + ax + b
//identity point as global
// const Id = new Point()

export class EllipticCurve extends FiniteField {
  a: number;
  b: number;
  points: Point[];
  constructor(a: number, b: number, p: number) {
    super(p);
    this.a = a;
    this.b = b;
    this.points = this.kRationalPoints;
  }

  get kRationalPoints(): Point[] {
    let points: Point[] = [];
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
    let table: Point[][] = [];

    const len = this.points.length;
    const len1 = len + 1;
    for (let i = 0; i < len; i++) {
      // init column-major matrix
      table[i] = [];
    }

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        table[i][j] = this.points[i].plus(this.points[j]);
        table[j][i] = table[i][j];
      }
    }

    return table;
  }
}
//! currently each Point contains all the context of the curve and field.
//! This is likely unnessecary and memory-heavy
export class Point {
  public x: number;
  public y: number;
  private curve: EllipticCurve;
  // i need this so .plus() can be a method on class Point
  // this allows Point to pass the monad context of the underlying curve under it's methods that make new Points

  constructor(curve: EllipticCurve, x = -1, y = -1) {
    // identity element by default
    this.x = x;
    this.y = y;
    this.curve = curve;
    // note this doesn't check if x,y are reduced mod p
  }
  // get subgroup(): Point[] {
  //
  // }

  equals(p: Point): boolean {
    return p.x == this.x && p.y == this.y;
  }

  get isIdentity(): boolean {
    return this.x == -1 && this.y == -1;
  }

  get formatted(): string {
    return this.isIdentity ? "∞" : `(${this.x}, ${this.y})`;
  }

  plus(p: Point): Point {
    if (this.isIdentity) return p;
    if (p.isIdentity) return this;

    let m: number;
    if (this.x == p.x) {
      // either opposite eachother or they're the same point
      if (this.y == mod(-p.y, this.curve.characteristic)) {
        // if theyre inverses to eachother
        return new Point(this.curve); // return the identity
      } // otherwise theyre equal
      // from implicit differentiation we get the tangent:
      // m = \frac{3x^2 + a}{2y} \mod field.characteristic
      m = mod(
        (3 * (this.x * this.x) + this.curve.a) *
          this.curve.inverses[mod(2 * this.y, this.curve.characteristic)],
        this.curve.characteristic
      );
    } else {
      // m = \frac{py - qy}{px - qx} \mod field.characteristic
      m = mod(
        (p.y - this.y) * this.curve.inverses[mod(p.x - this.x, this.curve.characteristic)],
        this.curve.characteristic
      );
    }
    // xr = \frac{m^2 - px - qx}{2*py} \mod field.characteristic
    const xr = mod(
      (m ** 2 - p.x - this.x) * this.curve.inverses[mod(2 * this.y, this.curve.characteristic)],
      this.curve.characteristic
    );
    const yr = mod(-(this.y + m * (xr - this.x)), this.curve.characteristic);
    return new Point(this.curve, xr, yr);
  }

  repeatedAddition(n: number): Point {
    if (n > 1) {
      return this.plus(this.repeatedAddition(n - 1));
    } else if (n == 1) {
      return this; // base case is P^1 = P
    } else if (n == 0) {
      return new Point(this.curve); // P^0 = Id
    } else {
      throw new Error("pls specify a positive exponent");
    }
  }

  get subgroup(): Point[] {
    let subset: Point[] = [];
    let next: Point = this;
    do {
      subset.push(this);
      next = next.plus(this);
    } while (!next.equals(this));
    return subset;
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
