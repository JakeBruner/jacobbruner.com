// code modified from gl-matrix, ported to typescript

export const translate43 = (a: number[], vector: number[]): number[] => {
  const x = vector[0],
    y = vector[1],
    z = vector[2];

  let out = a;

  out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
  out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
  out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
  out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];

  return out;
};
