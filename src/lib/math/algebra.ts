// type Dim = 4 | 8 | 16;

class AlgebraElement<Dim extends number> {
  readonly dimension: number;
  cf: number[];

  constructor(dimension: Dim, ...values: number[]) {
    this.dimension = dimension as number;
    if (values.length >= this.dimension) {
      this.cf = values.slice(0, this.dimension);
    } else {
      this.cf = new Array<number>(this.dimension);
    }
  }

  add(number: AlgebraElement<Dim>): AlgebraElement<Dim> {
    const ret = this.cf.map((val, idx) => val + number.cf[idx]);
    return new AlgebraElement<Dim>(this.dimension as Dim, ...ret);
  }
  // caley dickenson construction
  multiply(num: AlgebraElement<Dim>): AlgebraElement<Dim> {
    const conj = (x: number[]): number[] => {
      const neg = x.map((cf) => -1 * cf);
      neg[0] *= -1;
      return neg;
    };

    const caleyDickenson = (x: number[], y: number[]): number[] => {
      const n = x.length;

      if (n === 1) return [x[0] * y[0]];

      const m = Math.floor(n / 2);
      // any real v.s. of dimension 2^m

      const a = x.slice(0, m);
      const b = x.slice(m);
      const c = y.slice(0, m);
      const d = y.slice(m);

      const ac = caleyDickenson(a, c);
      const bdConj = caleyDickenson(b, conj(d));
      const ad = caleyDickenson(a, d);
      const bcConj = caleyDickenson(b, conj(c));

      // Correctly combine the results
      const result = [];
      for (let i = 0; i < m; i++) {
        result[i] = ac[i] + bdConj[i]; // This part might need adjustment based on the Cayley-Dickson rules
        result[i + m] = ad[i] + bcConj[i]; // Similarly, adjust based on the specific algebra
      }
      return result;
    };

    const newCfs: number[] = caleyDickenson(this.cf, num.cf);

    return new AlgebraElement<Dim>(this.dimension as Dim, ...newCfs);
  }
  conj(): AlgebraElement<Dim> {
    const neg = this.cf.map((cf) => -1 * cf);
    neg[0] *= -1;
    return new AlgebraElement<Dim>(this.dimension as Dim, ...neg);
  }
}

export class H extends AlgebraElement<4> {
  constructor(...values: number[]) {
    super(4, ...values);
  }

  add(quat: H): H {
    return new H(
      this.cf[0] + quat.cf[0],
      this.cf[1] + quat.cf[1],
      this.cf[2] + quat.cf[2],
      this.cf[3] + quat.cf[3]
    );
  }
  //override
  multiply(quat: H): H {
    return new H(
      this.cf[0] * quat.cf[0] -
        this.cf[1] * quat.cf[1] -
        this.cf[2] * quat.cf[2] -
        this.cf[3] * quat.cf[3],
      this.cf[0] * quat.cf[1] +
        this.cf[1] * quat.cf[0] +
        this.cf[2] * quat.cf[3] -
        this.cf[3] * quat.cf[2],
      this.cf[0] * quat.cf[2] -
        this.cf[1] * quat.cf[3] +
        this.cf[2] * quat.cf[0] +
        this.cf[3] * quat.cf[1],
      this.cf[0] * quat.cf[3] +
        this.cf[1] * quat.cf[2] -
        this.cf[2] * quat.cf[1] +
        this.cf[3] * quat.cf[0]
    );
  }

  //override
  conj(): H {
    return new H(this.cf[0], -1 * this.cf[1], -1 * this.cf[2], -1 * this.cf[3]);
  }
}
