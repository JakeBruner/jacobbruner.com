export default class FFT {
  private real: Float32Array;
  private imag: Float32Array;

  constructor(size: number) {
    this.real = new Float32Array(size);
    this.imag = new Float32Array(size);
  }

  private fft(re: Float32Array, im: Float32Array, inverse = false) {
    const n = re.length;

    if (n === 1) {
      // Trivial case, return the input data
      return { re, im };
    }

    // Split the input data into even and odd indices
    const evenRe = new Float32Array(n / 2);
    const evenIm = new Float32Array(n / 2);
    const oddRe = new Float32Array(n / 2);
    const oddIm = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      evenRe[i] = re[i * 2];
      evenIm[i] = im[i * 2];
      oddRe[i] = re[i * 2 + 1];
      oddIm[i] = im[i * 2 + 1];
    }

    // Compute the FFT of the even and odd indices
    const { re: evenFFTRe, im: evenFFTIm } = this.fft(evenRe, evenIm, inverse);
    const { re: oddFFTRe, im: oddFFTIm } = this.fft(oddRe, oddIm, inverse);

    // Combine the results
    const halfN = n / 2;
    const sign = inverse ? 1 : -1;
    for (let i = 0; i < halfN; i++) {
      const k = i + halfN;
      const angle = (sign * 2 * Math.PI * i) / n;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      re[i] = evenFFTRe[i] + cos * oddFFTRe[i] - sin * oddFFTIm[i];
      im[i] = evenFFTIm[i] + cos * oddFFTIm[i] + sin * oddFFTRe[i];
      re[k] = evenFFTRe[i] - (cos * oddFFTRe[i] - sin * oddFFTIm[i]);
      im[k] = evenFFTIm[i] - (cos * oddFFTIm[i] + sin * oddFFTRe[i]);
    }

    return { re, im };
  }

  public transform(re: Float32Array, im: Float32Array) {
    // Check that the input arrays are the same length
    if (re.length !== im.length) {
      throw new Error("Real and imaginary arrays must have the same length.");
    }

    // Check that the input length is a power of 2
    if (re.length && re.length - 1 !== 0) {
      throw new Error("Input length must be a power of 2.");
    }

    // Copy the input arrays to the internal arrays
    this.real.set(re);
    this.imag.set(im);

    // Compute the FFT
    this.fft(this.real, this.imag);
  }

  public inverseTransform(re: Float32Array, im: Float32Array) {
    // Check that the input arrays are the same length
    if (re.length !== im.length) {
      throw new Error("Real and imaginary arrays must have the same length.");
    }

    // Check that the input length is a power of 2
    if (re.length && re.length - 1 !== 0) {
      throw new Error("Input length must be a power of 2.");
    }

    // Copy the input arrays to the internal arrays
    this.real.set(re);
    this.imag.set(im);

    // Compute the inverse FFT
    this.fft(this.real, this.imag, true);

    // Scale the output by the inverse of the input length
    const n = re.length;
    const scale = 1 / n;
    for (let i = 0; i < n; i++) {
      re[i] *= scale;
      im[i] *= scale;
    }
  }

  public getReal() {
    return this.real;
  }

  public getImag() {
    return this.imag;
  }
}
