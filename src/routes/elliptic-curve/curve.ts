const mod = (a: number, n: number): number => {
  return ((a % n) + n) % n;
};

// Y^2 = X^3 + aX + b 
export let a = 4;
export let b = 3;
export let char = 7; // characteristic of the finite field

const isPrime = function(n: number) {
  if (mod(n, 2) === 0) { return false; }
  for (let d = 3; (d^2) < n; d += 2) {
    if (mod(n, d) === 0) { return false; }
  }
  return true;
};

// this is some of the sexiest code ive written
let sqrt: number[] = [];
let inv: number[] = [];

for (let i=0; i < char ; i++) {
  sqrt[i] = -1;
}

for (let i = 0; i < char; i++) {
  if (i <= char/2) { // so i^2 is not > char
    sqrt[i*i % char] = i; // computing quadratic residues
  }
  for (let j = i; j < char; j++) {
    if ((i*j) % char == 1) { // if i and j are inverse
      inv[i] = j; // write j as the i-th element of inv
      inv[j] = i; // write i as the j-th element of inv
      break;
    }
  }
}

// in form y^2 = x^3 + ax + b

//identity point as global
// const Id = new Point()

// dont ask why im diong this in typescript
class Point {
  x: number;
  y: number;
  constructor(x = -1, y = -1) { // identity element by default
    this.x = x;
    this.y = y;
    // note this doesn't check if x,y are reduced mod p
  }
  // get subgroup(): Point[] {
  //
  // }

  equals(p: Point): boolean {
    return ((p.x == this.x) && (p.y == this.y));
  }

  get isIdentity(): boolean {
    return ((this.x == -1) && (this.y == -1));
  }

  get formatted(): string {
    return `(${this.x}, ${this.y})`
  }

  plus(p: Point): Point {
    if (this.isIdentity) return p;
    if (p.isIdentity) return this;

    let m: number;
    if (this.x == p.x) { // either opposite eachother or they're the same point
      if (this.y == mod(-p.y, char)) { // if theyre inverses to eachother
        return new Point(); // return the identity
      } // otherwise theyre equal
        // from implicit differentiation we get the tangent:
        // m = \frac{3x^2 + a}{2y} \mod char
       m = mod((3 * (this.x ** 2) + a) * inv[mod(2*this.y, char)], char);
    } else {
      // m = \frac{py - qy}{px - qx} \mod char
      m = mod( (p.y - this.y) * inv[mod(p.x - this.x, char)], char)
    }
    // xr = \frac{m^2 - px - qx}{2*py} \mod char
    const xr = mod((m*m - p.x - this.x)*inv[mod(2*this.y, char)], char);
    const yr = mod(-(this.y + m*(xr - this.x)), char);
    return new Point(xr, yr);
  }

  repeatedAddition(n: number): Point {
    if (n > 1) {
      return this.plus(this.repeatedAddition(n - 1))
    } else if (n == 1) {
      return this; // base case is P^1 = P
    } else if (n == 0) {
      return new Point(); // P^0 = Id
    } else {
      throw new Error("pls specify a positive exponent")
    }

  }

  subgroupGenerator = function*() {
    let elem: Point = this;
    while (!elem.isIdentity) {
      elem = elem.repeatedAddition(2)
      yield elem;
    }
  
  }

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

const pointa = new Point()
const pointb = new Point(1,1)
console.log(pointb);
const sum = pointa.plus(pointb)
console.log(sum)
const product = pointb.repeatedAddition(5)
console.log(product)
const gen = pointb.subgroupGenerator();
for (let i = 0; i < 10; i++) {
  console.log(gen.next().value)
}