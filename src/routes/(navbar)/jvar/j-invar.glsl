precision highp float;

uniform vec2 resolution;
uniform float colorHue;

const float PI = 3.14159265358979323846;
// #define cmul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
// #define cdiv(a, b) vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y)))
// #define cconj(a) vec2(a.x, -a.y)

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
  return vec2((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y), (a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y));
}

// {\displaystyle j(\tau )=q^{-1}+744+196884q+21493760q^{2}+864299970q^{3}+20245856256q^{4}+\cdots }
vec2 kleinj(vec2 tau) {
  vec2 q = exp(2.0 * PI * tau);

  vec2 j = cdiv(1.0, q) + 744.0 + 196884.0 * q + 21493760.0 * q * q + 864299970.0 * q * q * q + 20245856256.0 * q * q * q * q;
  return j;
}

vec3 hsvToRgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
  vec2 tau = vec2(uv.x * 4.0, 1.0 - uv.y * 2.0); // Map y to (0, 1]

  vec2 j = kleinj(tau);

  // float arg = atan(j.y, j.x);
  // float mag = length(j);
  // vec3 color = hsvToRgb(vec3(mod(arg / (2.0 * PI) + colorHue, 1.0), 0.8, // Slightly reduce saturation
  // clamp(log(mag + 1.0) / log(1000.0), 0.0, 1.0) // Adjust magnitude scaling
  // ));
  gl_FragColor = vec4(abs(j) / (1.0 + abs(j)), 0.0, 1.0);
}