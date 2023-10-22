in vec2 v_uv;
uniform vec3 cameraPosition;
uniform vec3 cameraTarget;
uniform float time;
uniform float u_fov;
uniform vec2 u_resolution;
const int MAX_ITERATIONS = 64;
const int MAX_LOWP_ITERATIONS = 32;
const float HIT_THRESHOLD = 0.001;
const int MAX_STEPS = 128;
const float MAX_DISTANCE = 5.0;
const float R = 3.0;

// Function to compute the distance to the fractal surface
float fractalDF(vec3 position) {
  vec3 z = position;
  float dr = 1.0;
  float r = 0.0;
  for(int i = 0; i < MAX_ITERATIONS; i++) {
    r = length(z);
    if(r > 2.0)
      break;
    // Compute the new position and derivative
    float r7 = pow(r, 7.0);
    float r8 = pow(r, 8.0);
    float theta = acos(z.z / r);
    float phi = atan(z.y, z.x);
    dr = r7 * 8.0 * dr + 1.0;
    theta = theta * 8.0;
    phi = phi * 8.0;
    z = r8 * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + position;
  }
  return 0.5 * log(r) * r / dr;
}

float lowp_fractalDF(vec3 position) {
  vec3 z = position;
  float dr = 1.0;
  float r = 0.0;

  for(int i = 0; i < MAX_LOWP_ITERATIONS; i++) {
    r = length(z);
    if(r > 2.0)
      break;
    // Compute the new position and derivative
    float r7 = pow(r, 7.0);
    float r8 = pow(r, 8.0);
    float theta = acos(z.z / r);
    float phi = atan(z.y, z.x);
    dr = r7 * 8.0 * dr + 1.0;
    theta = theta * 8.0;
    phi = phi * 8.0;
    z = r8 * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + position;
  }
  return 0.5 * log(r) * r / dr;
}

vec3 normal(vec3 position) {
  const float EPS = 0.001;
  return normalize(vec3(lowp_fractalDF(position + vec3(EPS, 0.0, 0.0)) - lowp_fractalDF(position - vec3(EPS, 0.0, 0.0)), lowp_fractalDF(position + vec3(0.0, EPS, 0.0)) - lowp_fractalDF(position - vec3(0.0, EPS, 0.0)), lowp_fractalDF(position + vec3(0.0, 0.0, EPS)) - lowp_fractalDF(position - vec3(0.0, 0.0, EPS))));
}

out vec4 fragColor;

vec3 hsvtorgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return vec3(c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y));
}

float occlusion(vec3 position, vec3 normal) {
  float occlusion = 0.0;
  float weight = 0.0;
  for(int i = 1; i <= 2; i++) {
    float r = 0.1 * float(i);
    vec3 samplePosition = position + normal * r;
    float sampleDistance = lowp_fractalDF(samplePosition);
    float occlusionFactor = r - sampleDistance;
    occlusion += clamp(occlusionFactor, 0.0, 1.0);
    weight += 1.0;
  }
  return 1.0 - occlusion / weight;
}

float shadow(vec3 ro, vec3 rd, float maxd) {
  float res = 1.0;
  float t = HIT_THRESHOLD;
  vec3 ro_plus_t_rd; // precalculate ro + t * rd
  for(int i = 0; i < 25; i++) {
    if(res < 0.01 || t > maxd)
      break;
    ro_plus_t_rd = ro + t * rd; // use precalculated value
    float h = lowp_fractalDF(ro_plus_t_rd);
    float h_t = h / t;
    res = min(res, 10.0 * h_t); // avoid another multiplication
    t += h;
  }
  return clamp(res, 0.0, 1.0);
}

vec3 getCameraRayDir(vec2 uv, vec3 cameraPosition, vec3 cameraTarget, float u_fov, vec2 u_resolution) {
  vec3 forward = normalize(cameraTarget - cameraPosition);
  vec3 right = cross(vec3(0.0, 1.0, 0.0), forward);
  vec3 up = cross(forward, right);
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  return normalize(uv.x * right + uv.y * up + 1.0 / tan(u_fov / 2.0) * forward);
}

// vec3 getLight(vec3 lightPosition, vec3 normal, vec3 rayDir) {
//   vec3 lightDir = normalize(lightPosition - rayDir);
//   float lightIntensity = max(dot(normal, lightDir), 0.0);
//   return vec3(lightIntensity);
// }

vec3 render(vec3 rayOrigin, vec3 rayDir, vec3 lightPosition) {
  vec3 col;

  float t = 0.0;
  bool hit = false;

  // Move some computations outside the loop.
  vec3 p;
  vec3 surfaceNormal;
  vec3 totalLight;
  float ao;
  float shadowFactor;
  float normalizedDistance;
  vec3 fractalColor;
  vec3 ambientLight = vec3(0.05);
  vec3 avgLight;

  for(int i = 0; i < MAX_STEPS; i++) {
    p = rayOrigin + t * rayDir;
    float distance = fractalDF(p);
    if(distance < HIT_THRESHOLD) {
      hit = true;
      break;
    }
    if(t > MAX_DISTANCE)
      break;

    surfaceNormal = normal(p);
    ao = occlusion(p, surfaceNormal); // compute the occlusion factor

    // Compute the shadow 
    shadowFactor = shadow(p, lightPosition - p, MAX_DISTANCE);
    ao *= shadowFactor;

    // Compute the color based on the hit
    normalizedDistance = distance / HIT_THRESHOLD; // Normalize the distance to range [0, 1]
    fractalColor = hsvtorgb(vec3(normalizedDistance, 0.7, clamp(ao, 0.3, 1.0)));

    // totalLight = vec3(0.0);
    // const int numSamples = 3;
    // for(int j = 0; j < numSamples; j++) {
    //   vec3 sampleLightPosition = lightPosition + vec3((float(j % 4) - 1.5) * 0.5, (float(j / 4) - 0.5) * 0.5, 0.0);
    //   totalLight += getLight(sampleLightPosition, surfaceNormal, p);
    // }
    // avgLight = totalLight / float(numSamples);

    col = fractalColor;
    t += distance;
  }

  if(!hit) // If there was no hit, use skybox color
    col = vec3(0.54, 0.3, 0.6) - (rayDir.y * 0.4);

  return col;
}

void main() {
  vec3 lightPosition = vec3(0.0, 5.0, 4.0);
  // Compute the ray direction 
  vec3 cameraPosition = vec3(sin(time) * R, 0.0, cos(time) * R);

  vec3 rayDir = getCameraRayDir(v_uv, cameraPosition, vec3(0.0), u_fov, u_resolution);
  // Render the scene
  vec3 col = render(cameraPosition, rayDir, lightPosition);

  // Apply gamma correction
  col = pow(col, vec3(0.5));

  // Output to screen
  fragColor = vec4(col, 1.0);

  // Debug
  // fragColor = vec4(rayDir, 1.0);

}