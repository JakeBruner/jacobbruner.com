precision highp float;

uniform vec2 resolution;
uniform float colorHue;

const float PI = 3.14159265358979323846;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
  float denom = dot(b, b);
  return vec2(dot(a, b) / denom, (a.y * b.x - a.x * b.y) / denom);
}

vec2 cexp(vec2 z) {
  return exp(z.x) * vec2(cos(z.y), sin(z.y));
}

vec3 hsvToRgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 theta2(vec2 z, vec2 q) {
  vec2 sum = vec2(0.0, 0.0);
  vec2 qn = vec2(1.0, 0.0);
  for(int n = 0; n < 50; n++) {
    sum += qn * cexp(vec2(0.0, 2.0 * float(n) * z.x));
    qn = cmul(qn, q);
  }
  return sum;
}

vec2 theta3(vec2 z, vec2 q) {
  vec2 sum = vec2(1.0, 0.0);
  vec2 qn = q;
  for(int n = 1; n < 100; n += 1) {
    sum += qn * (cexp(vec2(0.0, 2.0 * float(n) * z.x)) + cexp(vec2(0.0, -2.0 * float(n) * z.x)));
    qn = cmul(qn, q);
  }
  return sum;
}

vec2 theta4(vec2 z, vec2 q) {
  return theta3(z, -q);
}

vec2 kleinj(vec2 tau) {
  vec2 q = cexp(vec2(0.0, PI * tau.x));
  vec2 t2 = theta2(vec2(0.0, 0.0), q);
  vec2 t3 = theta3(vec2(0.0, 0.0), q);
  vec2 t4 = theta4(vec2(0.0, 0.0), q);

  vec2 t2_8 = cmul(t2, t2);
  t2_8 = cmul(t2_8, t2_8);
  t2_8 = cmul(t2_8, t2_8);

  vec2 t3_8 = cmul(t3, t3);
  t3_8 = cmul(t3_8, t3_8);
  t3_8 = cmul(t3_8, t3_8);

  vec2 t4_8 = cmul(t4, t4);
  t4_8 = cmul(t4_8, t4_8);
  t4_8 = cmul(t4_8, t4_8);

  vec2 P = t2_8 + t3_8 + t4_8;
  P = cmul(P, P);
  P = cmul(P, t2_8 + t3_8 + t4_8);

  vec2 Q = cmul(t2, t3);
  Q = cmul(Q, t4);
  Q = cmul(Q, Q);
  Q = cmul(Q, Q);
  Q = cmul(Q, Q);
  Q = cmul(Q, vec2(54.0, 0.0));

  return cdiv(P, Q);
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