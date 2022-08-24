const mod = (a: number, n: number) => {
  return ((a % n) + n) % n;
};

// euclidean algorithm to compute inverses
// TODO maybe store values in memory so its not recomputing
const inverse = (a: number, n: number) => { // euclidean algorithm
  [a, m] = [Number(a), Number(n)];
  if (Number.isNaN(a) || Number.isNaN(n)) {
      return NaN; //invalid input
  }
  a = mod(a, n);
  if (!a || m < 2) {
      return NaN; // invalid input
  }
  // find the gcd
  const s = []
  let b = n
  while (b) { // b is truthy until 0
      [a, b] = [b, a % b]
      s.push({
          a,
          b
      })
  }
  if (a !== 1) {
      throw new Error(`no inverse of ${a} mod ${n}`) // inverse does not exist
  }
  // find the inverse
  let x = 1;
  let y = 0;
  for (let i = s.length - 2; i >= 0; --i) {
      [x, y] = [y, x - y * Math.floor(s[i].a / s[i].b)]
  }
  return mod(y, n);
}

// simple prime testing algorithm
// i can definitly optimise this
const isPrime = function(n: number) {
  if (mod(n, 2) === 0) { return false; }
  for (let d = 3; (d^2) < n; d += 2) {
    if (mod(n, d) === 0) { return false; }
  }
  return true;
};

// an interface for points on the curve
// dont ask why im diong this in typescript
interface Point {
  x: number;
  y: number;
}

// interface M<T> {

// }

// function unit<T>(value: T): M<T> {
//     // ...
// }

// function bind<T, U>(instance: M<T>, transform: (value: T) => M<U>): M<U> {
//     // ...
// }

