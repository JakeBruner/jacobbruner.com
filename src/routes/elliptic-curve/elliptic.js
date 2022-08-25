var curve = function(a, b, r) {
  'use strict';

 a = parseInt( a, 10 );
 b = parseInt( b, 10 );
 r = parseInt( r, 10 );

  var _a = a,
      _b = b,
      _r = r;

  var i,j;

  var sqrt = [],
      inv = [],
      points = [],
      addTable;

  // helper functions
  var mod = function(x, r) { return ((x % r) + r) % r; };
  var isPrime = function(n) {
    var d;
    // no need to implement advanced algorithms
    // for toy instances
    if (mod(n, 2) === 0) { return false; }
    for (d=3; d*d<n; d=d+2) {
      if (mod(n, d) === 0) { return false; }
    }
    return true;
  };

  // a Point class
  var Point = function(x, y) {
    var stringRegExp = /\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*/;
    this.x = x;
    this.y = y;
    var _stringRep;

    if (typeof x === 'string') {
      if ( stringRegExp.test( x ) ) {
        var _sres = stringRegExp.exec( x );
        this.x = parseInt( _sres[1], 10);
        this.y = parseInt( _sres[2], 10);
      }
    }

    if (typeof x === 'object' && 'x' in x && 'y' in x) {
        this.x = x.x;
        this.y = x.y;
    }

    if (typeof this.x !== 'number') { this.x = -1; this.y = -1; }
    if (typeof this.y !== 'number') { this.x = -1; this.y = -1; }
  };

  Point.prototype.isInfty  = function() {
    return ((this.x == -1) && (this.y ==-1));
  };

  Point.prototype.isNaN  = function() {
    return (isNaN(this.x) || isNaN(this.y));
  };

  Point.prototype.toString = function() {
    if (!this._stringRep) {
      this._stringRep = (((this.x == -1) && (this.y == -1)) ?
                  '&infin;' : '(' + this.x + ',' + this.y + ')');
    }
    return this._stringRep;
  };

  Point.prototype.eq  = function(p) {
    return ((this.x == p.x) && (this.y == p.y));
  };

  Point.prototype.plus = function(p) {
    if (this.isInfty()) return p;
    if (   p.isInfty()) return this;

    var s;
    if (this.x === p.x) {
      if ((this.y !== p.y) || (this.y === 0)) {
        return new Point(-1,-1);
      }
      // self addition
      s = mod( (3*this.x*this.x + _a) * inv[mod(2*this.y, _r)] ,_r);
    } else {
      s = mod( (p.y - this.y)* inv[mod(p.x - this.x, _r)], _r);
    }

    var rx = mod( s*s - p.x - this.x,       _r ),
        ry = mod( s*this.x - s*rx - this.y, _r );

    return new Point(rx,ry);
  };

  Point.prototype.times = function( t ) {
    if (t === 1) {
      return this;
    } else if (t > 1) {
      return this.plus( this.times( t-1 ) );
    } else if (t === 0) {
      return new Point();
    }
    // t < 0: not implemented
  };

  // what a wonderful application for ES6 generators ;-)
  // however, let's stick with old browsers
  Point.prototype.generate = function() {
    var next = this, res = [];
    do {
      res.push( next );
      next = next.plus( this );
    } while ( !next.isNaN() && !next.eq( this ) );

    return (!next.isNaN()) ? res : undefined;
  };

  // initialize helper arrays: sqrt and inv
  for (i=0; i<r; i++) {
    sqrt[i] = -1;
  }

  for (i=0; i<r; i++) {
    if (i <= r/2) { sqrt[i*i % r] = i; }
    for (j=i; j<r; j++) {
      if ((i*j) % r === 1) {
    	  inv[i] = j;
    	  inv[j] = i;
    	  break;
      }
    }
  }
  console.log(sqrt)
  console.log(inv)
  const pointa = new Point(-1,-1)
const pointb = new Point(1,1)
console.log(pointb);
const sum = pointa.plus(pointb)
console.log(sum)
const product = pointb.times(5)
console.log(product)
const gen = pointb.generate();
console.log(gen);
console.log(pointb)
console.log(pointb.repeatedAddition(2))
console.log(inv)
console.log(sqrt)

  // compute list of points on this curve
  // note: r might not be prime
  // first add infinity
  points.push( new Point() );
  for (i=0; i<r; i++) {
    for (j=0; j<=r/2; j++) {
      if (j*j % r === mod(i*i*i + a*i + b, r)) {
        points.push( new Point(i,j) );
        if (j % r !== (r-j) % r) {
          points.push( new Point(i,r-j) );
        }
      }
    }
  }

  // build interface
  return {
    getA: function() { return _a; },
    getB: function() { return _b; },
    getR: function() { return _r; },

    getPoints: function() { return points.slice(); },

    getPoint: function(arg1, arg2) {
      // delegate argument type checks to Point constructor
      var search = new Point(arg1, arg2);
      for (i=0; i<points.length; i++) {
        if (search.eq(points[i])) {
          return search;
        }
      }
      return undefined;
    },

    getAdditionTable: function() {
      if ( !addTable ) {
        var i,j;

        addTable = [];
        for (i=0; i<points.length; i++) {
          addTable[i] = [];
        }

        for (i=0; i<points.length; i++) {
          for (j=i; j<points.length; j++) {
            addTable[i][j] = points[i].plus( points[j] );
            addTable[j][i] = addTable[i][j];
          }
        }
      }
      return addTable;
    },

    rIsPrime: function() { return isPrime(_r); },

    isNonSingular: function() {
      if (_r > 3) {
        return (mod(4*_a*_a*_a + 27*_b*_b, _r) !== 0);
      }
    }
  };
};

curve(4,3,7);