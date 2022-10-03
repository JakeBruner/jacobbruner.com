vec2 g(vec2 t, int k) { // modular invariant
  vec2 sum = vec2(0,0);
  for (int m = 1; m < 10; m++) {  // sum over the lattice points
    for (int n = -5; n < 0; n++) {  
      sum += cpow(
        float(m)*t + vec2(n,0),
        vec2(-2 * k, 0)
      );
    }
    for (int n = 1; n < 5; n++) {  
      sum += cpow(
        float(m)*t + vec2(n,0),
        vec2(-2 * k, 0)
      );
    }
    sum += cpow(
      float(m)*t,
      vec2(-2 * k, 0)
    );
    sum += cpow(
      vec2(m, 0),
      vec2(-2 * k, 0)
    );

  }
  return 2.0 * sum;
} 

vec2 mapping(vec2 z) {
  return g(z,2) + 24* g(z,3);
} 

vec2 mapping(vec2 z) { // modular discriminant
  return cpow(g(z,2), 3.0*ONE) - 27 * cpow(g(z,3), 2.0*ONE);
} 

vec2 mapping(vec2 z) {
  return cdiv(ONE, ONE - 2.45 * cdiv(  // 1 over
    csquare( g(z, 3) ),
    cpow( g(z, 2), 3.0 * ONE )
  ));
}

// https://github.com/sagemath/sage/blob/develop/src/sage/modular/modform/j_invariant.py

// vec2 mapping(vec2 z) {
//   return 1728 * cdiv(
//     cpow( g(z, 2)), 3.0* ONE),
//     ( cpow(g(z,2), 3.0*ONE) - 27 * cpow(g(z,3), 2.0*ONE) )
//   // return cdiv(ONE, ONE - 2.45 * cdiv(  // 1 over
//   //   csquare( g(z, 3) ),
//   //   cpow( g(z, 2), 3.0 * ONE )
//   // ));
// }

// void main() {
//   vec2 z = mapping( vUv * 2.0 - 1.0 );
//   gl_FragColor = vec4( z, 0.0, 1.0 );
// }




