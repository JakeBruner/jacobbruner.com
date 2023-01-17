export type Big = number[];

const double = (n: Big) => {
  let carry = 0;

  for (let i = 0; i < n.length; i++) {
    n[i] = n[i] * 2 + carry;
    carry = Math.floor(n[i] / 10);
    n[i] %= 10;
  }

  if (carry !== 0) {
    n.push(carry);
  }

  return n;
};

const add = (n1: Big, n2: Big) => {
  let carry = 0;

  for (let i = 0; i < n1.length; i++) {
    n1[i] = n1[i] + n2[i] + carry;
    carry = Math.floor(n1[i] / 10);
    n1[i] %= 10;
  }
};

export const calcLast50Digits = (n: number | bigint) => {
  let digits = [1];

  for (let i = 1; i <= n; i++) {
    console.log(i);

    digits = double(digits);
  }

  return digits.slice(-50).reverse().join("");
};

// // q: is this the best way to do this?
// export const calcLast50DigitsBigInt = (n: number | bigint) => {
//   let digits = BigInt(1);

//   for (let i = 1; i <= n; i++) {
//     console.log(i);

//     digits = digits * 2n;
//   }

//   return digits.toString().slice(-50);
// };

// export const calcLast50DigitsBigInt2 = (n: number | bigint) => {
//   let digits = [BigInt(1)];

//   for (let i = 1; i <= n; i++) {
//     console.log(i);

//     digits = doubleBigInt(digits);
//   }

//   return digits.slice(-50).reverse().join("");
// };

// const doubleBigInt = (n: Big) => {
//   let carry = BigInt(0);

//   for (let i = 0; i < n.length; i++) {
//     n[i] = n[i] * 2n + carry;
//     carry = n[i] / 10n;
//     n[i] %= 10n;
//   }

//   if (carry !== 0n) {
//     n.push(carry);
//   }

//   return n;
// };

// const addBigInt = (n1: Big, n2: Big) => {
//   let carry = BigInt(0);

//   for (let i = 0; i < n1.length; i++) {
//     n1[i] = n1[i] + n2[i] + carry;
//     carry = n1[i] / 10n;
//     n1[i] %= 10n;
//   }
// };
