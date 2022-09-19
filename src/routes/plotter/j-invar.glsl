vec2 g(vec2 t, int k) { // modular invarient
  vec2 sum = vec2(0,0);
  for (int m = 1; m < 20; m++) {  
    for (int n = -10; n < 10; n++) {  
      if (n != 0) {

        sum += cpow(
          float(m)*t + vec2(n,0),
          vec2(-2 * k, 0)
        );

      }
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

vec2 mapping(vec2 z) { // j invarient
  return cdiv(ONE, ONE - 2.45 * cdiv(
    csquare( g(z, 3) ),
    cpow( g(z, 2), 3.0 * ONE )
  ));
}