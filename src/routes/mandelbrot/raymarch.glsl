in vec2 v_uv;
uniform vec3 cameraPosition;
uniform vec3 cameraTarget;
uniform float time;
uniform float u_fov;
uniform vec2 u_resolution;
const int MAX_ITERATIONS = 64;
const float HIT_THRESHOLD = 0.001;
const int MAX_STEPS = 256;

// Function to compute the distance to the fractal surface
float mandelbulb(vec3 position) {
  vec3 z = position;
  float dr = 1.0;
  float r = 0.0;
  for (int i = 0; i < MAX_ITERATIONS; i++) {
    r = length(z);
    if (r > 2.0) break;
    // Compute the new position and derivative
    float theta = acos(z.z / r);
    float phi = atan(z.y, z.x);
    dr = pow(r, 7.0) * 8.0 * dr + 1.0;
    float zr = pow(r, 8.0);
    theta = theta * 8.0;
    phi = phi * 8.0;
    z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + position;
  }
  return 0.5 * log(r) * r / dr;
}

vec3 normal(vec3 position) {
  const float EPS = 0.0001;
  return normalize(vec3(
    mandelbulb(position + vec3(EPS, 0.0, 0.0)) - mandelbulb(position - vec3(EPS, 0.0, 0.0)),
    mandelbulb(position + vec3(0.0, EPS, 0.0)) - mandelbulb(position - vec3(0.0, EPS, 0.0)),
    mandelbulb(position + vec3(0.0, 0.0, EPS)) - mandelbulb(position - vec3(0.0, 0.0, EPS))
  ));
}

out vec4 fragColor;

vec4 hsvtorgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return vec4(c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y), 1.0);
}

void main() {
  // Compute the ray direction 
  vec3 forward = normalize(cameraTarget - cameraPosition);
  vec3 right = cross(vec3(0.0, 1.0, 0.0), forward); 
  vec3 up = cross(forward, right); 
  vec2 uv = v_uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y; 
  vec3 rayDirection = normalize(uv.x * right + uv.y * up + 1.0 / tan(u_fov / 2.0) * forward);

  vec3 rayOrigin = cameraPosition;
  vec3 lightPosition = cameraPosition + vec3(0.0, 2.0, 3.0);
  
  float t = 0.0;
  for (int i = 0; i < MAX_STEPS; i++) {
      vec3 position = rayOrigin + rayDirection * t;
      float distance = mandelbulb(position);
      if (distance < HIT_THRESHOLD) {
        vec3 surfaceNormal = normal(position);
        vec3 lightDirection = normalize(lightPosition - position); // direction of the light

        float lambert = max(0.0,  dot(surfaceNormal, lightDirection))*2.0; // compute the lambert factor
        
        // Compute the color based on the hit
        float normalizedDistance = distance / HIT_THRESHOLD; // Normalize the distance to range [0, 1]
        // an interesting, colorful color mapping based on distance
        fragColor = hsvtorgb(vec3(pow(normalizedDistance,2.0), 0.7, 0.9));
        fragColor.rgb *= lambert;
      
        return;
      }
      t += distance;
    }
    fragColor = vec4(0.0, 0.0, 0.0, 1.0); // Background color
  
}
