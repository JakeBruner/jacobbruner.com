/** The same four-term q expansion used by the fragment shader. */
export function jInvariant(real: number, imaginary: number): [number, number] {
  const radius = Math.exp(-2 * Math.PI * imaginary);
  const angle = 2 * Math.PI * real;
  const q: [number, number] = [radius * Math.cos(angle), radius * Math.sin(angle)];
  const result: [number, number] = [Math.cos(angle) / radius + 744, -Math.sin(angle) / radius];
  let power: [number, number] = q;
  for (const coefficient of [196884, 21493760, 864299970, 20245856256]) {
    result[0] += coefficient * power[0];
    result[1] += coefficient * power[1];
    power = [power[0] * q[0] - power[1] * q[1], power[0] * q[1] + power[1] * q[0]];
  }
  return result;
}

export function invariantColor(real: number, imaginary: number, hue: number): [number, number, number] {
  const [x, y] = jInvariant(real, imaginary);
  const h = ((Math.atan2(y, x) / (2 * Math.PI) + hue) % 1 + 1) % 1;
  const value = Math.min(1, Math.log1p(Math.hypot(x, y)) / Math.log(1000));
  const sector = h * 6;
  const fraction = sector - Math.floor(sector);
  const low = value * 0.2;
  const descending = value * (1 - fraction * 0.8);
  const ascending = value * (1 - (1 - fraction) * 0.8);
  return [[value, ascending, low], [descending, value, low], [low, value, ascending],
    [low, descending, value], [ascending, low, value], [value, low, descending]][Math.floor(sector)] as [number, number, number];
}
