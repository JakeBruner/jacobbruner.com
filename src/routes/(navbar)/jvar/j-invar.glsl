precision highp float;
uniform vec2 resolution;
uniform float colorHue;
const float PI = 3.14159265358979323846;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 kleinj(vec2 tau) {
  float radius = exp(-2.0 * PI * tau.y);
  float angle = 2.0 * PI * tau.x;
  vec2 q = radius * vec2(cos(angle), sin(angle));
  vec2 q2 = cmul(q, q);
  vec2 q3 = cmul(q2, q);
  vec2 q4 = cmul(q3, q);
  return vec2(cos(angle), -sin(angle)) / radius + vec2(744.0, 0.0)
    + 196884.0 * q + 21493760.0 * q2 + 864299970.0 * q3 + 20245856256.0 * q4;
}

vec3 hsvToRgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
  vec2 tau = vec2(uv.x * 4.0, max(0.05, 1.0 - uv.y * 2.0));
  vec2 j = kleinj(tau);
  float hue = fract(atan(j.y, j.x) / (2.0 * PI) + colorHue);
  float value = clamp(log(length(j) + 1.0) / log(1000.0), 0.0, 1.0);
  gl_FragColor = vec4(hsvToRgb(vec3(hue, 0.8, value)), 1.0);
}
