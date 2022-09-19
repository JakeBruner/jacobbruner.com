// NOT MY CODE
// THIS IS COPIED FOR MY REFERENCE FROM http://www.madore.org/~david/math/e8w.html
// THiS CODE WAS WRITTEN BY DAVID MADORE

var haveTypedArrays = typeof Uint16Array === "function" && typeof Float32Array === "function";
// var haveTypedArrays = false;

// Coordinates of the roots (these are fixed):
var roots = new Array();

function createRoots() {
  function rootFirstKind(i0, i1, s0, s1) {
    var rt = [0, 0, 0, 0, 0, 0, 0, 0];
    rt[i0] = s0 ? -2 : 2;
    rt[i1] = s1 ? -2 : 2;
    return rt;
  }
  function rootSecondKind(s0, s1, s2, s3, s4, s5, s6) {
    var s7 = s0 ^ s1 ^ s2 ^ s3 ^ s4 ^ s5 ^ s6;
    return [
      s0 ? -1 : 1,
      s1 ? -1 : 1,
      s2 ? -1 : 1,
      s3 ? -1 : 1,
      s4 ? -1 : 1,
      s5 ? -1 : 1,
      s6 ? -1 : 1,
      s7 ? -1 : 1,
    ];
  }
  for (var i0 = 0; i0 < 8; i0++) {
    for (var i1 = i0 + 1; i1 < 8; i1++) {
      roots.push(rootFirstKind(i0, i1, false, false));
      roots.push(rootFirstKind(i0, i1, false, true));
      roots.push(rootFirstKind(i0, i1, true, false));
      roots.push(rootFirstKind(i0, i1, true, true));
    }
  }
  for (var i = 0; i < 128; i++) {
    roots.push(
      rootSecondKind(!!(i & 1), !!(i & 2), !!(i & 4), !!(i & 8), !!(i & 16), !!(i & 32), !!(i & 64))
    );
  }
  roots.sort(function (a, b) {
    // Lexicographic ordering
    for (var k = 0; k < 8; k++) {
      if (a[k] < b[k]) return -1;
      else if (a[k] > b[k]) return 1;
    }
    return 0;
  });
}

function sqnorm(a) {
  var ret = 0;
  for (var i = 0; i < a.length; i++) {
    var d = a[i];
    ret += d * d;
  }
  return ret;
}

function dotprod(a, b) {
  var ret = 0;
  for (var i = 0; i < a.length; i++) {
    ret += a[i] * b[i];
  }
  return ret;
}

function sqdist(a, b) {
  var ret = 0;
  for (var i = 0; i < a.length; i++) {
    var d = a[i] - b[i];
    ret += d * d;
  }
  return ret;
}

// List of edges (an edge connects each even entry of this array
// to the following):
var edges;

function createEdges() {
  var edges0 = new Array();
  for (var a = 0; a < roots.length; a++) {
    for (var b = a + 1; b < roots.length; b++) {
      if (sqdist(roots[a], roots[b]) == 8) {
        edges0.push(a);
        edges0.push(b);
      }
    }
  }
  if (haveTypedArrays) edges = new Uint16Array(edges0);
  else edges = edges0;
}

var gaussianStore = null;
function gaussian() {
  // Generate a Gaussian variable by Box-Muller.
  if (gaussianStore == null) {
    var u0 = Math.random();
    var u1 = Math.random();
    gaussianStore = Math.sqrt(-2 * Math.log(u0)) * Math.cos(2 * Math.PI * u1);
    return Math.sqrt(-2 * Math.log(u0)) * Math.sin(2 * Math.PI * u1);
  } else {
    var ret = gaussianStore;
    gaussianStore = null;
    return ret;
  }
}

function gramSchmidt(matrix, orthcond) {
  // Make matrix normed and orthogonal.
  if (typeof orthcond === "undefined") {
    orthcond = new Array(matrix.length);
    for (var k = 0; k < matrix.length; k++) {
      orthcond[k] = new Array(k);
      for (var l = 0; l < k; l++) orthcond[k][l] = l;
    }
  }
  for (var k = 0; k < orthcond.length; k++) {
    var d;
    for (var l = 0; l < orthcond[k].length; l++) {
      var k2 = orthcond[k][l];
      d = dotprod(matrix[k], matrix[k2]);
      for (var i = 0; i < matrix[k].length; i++) matrix[k][i] -= d * matrix[k2][i];
    }
    d = Math.sqrt(sqnorm(matrix[k]));
    for (var i = 0; i < matrix[k].length; i++) matrix[k][i] /= d;
  }
}

function zeroMatrix(rows, cols) {
  var mat = new Array(rows);
  for (var i = 0; i < rows; i++) {
    mat[i] = new Array(cols);
    for (var j = 0; j < cols; j++) mat[i][j] = 0;
  }
  return mat;
}

function gaussianVector(size) {
  var vec = new Array(size);
  for (var j = 0; j < size; j++) vec[j] = gaussian();
  return vec;
}

function identityMatrix(size) {
  var mat = new Array(size);
  for (var i = 0; i < size; i++) {
    mat[i] = new Array(size);
    for (var j = 0; j < size; j++) mat[i][j] = i == j ? 1 : 0;
  }
  return mat;
}

function randomOrthogonalMatrix(rows, cols) {
  var mat = new Array(rows);
  for (var i = 0; i < rows; i++) mat[i] = gaussianVector(cols);
  gramSchmidt(mat);
  return mat;
}

var octonionSignTab = [
  // Convention here is that:
  //   e3=e1*e2, e5=e1*e4, e6=e2*e4, e7=(e1*e2)*e4
  // 0   1   2   3   4   5   6   7
  [+1, +1, +1, +1, +1, +1, +1, +1], // 0
  [+1, -1, +1, -1, +1, -1, -1, +1], // 1
  [+1, -1, -1, +1, +1, +1, -1, -1], // 2
  [+1, +1, -1, -1, +1, -1, +1, -1], // 3
  [+1, -1, -1, -1, -1, +1, +1, +1], // 4
  [+1, +1, -1, +1, -1, -1, -1, +1], // 5
  [+1, +1, +1, -1, -1, +1, -1, -1], // 6
  [+1, -1, +1, +1, -1, -1, +1, -1], // 7
];

function octonionProduct(x, y) {
  // Multiply two octonions
  var z = new Array(8);
  for (var i = 0; i < 8; i++) z[i] = 0;
  for (var i = 0; i < 8; i++)
    for (var j = 0; j < 8; j++) z[i ^ j] += octonionSignTab[i][j] * x[i] * y[j];
  return z;
}

function randomG2Matrix() {
  // Return a random element of the G2 group
  var mat = new Array(8);
  mat[0] = [1, 0, 0, 0, 0, 0, 0, 0];
  mat[1] = gaussianVector(8);
  mat[1][0] = 0;
  mat[2] = gaussianVector(8);
  mat[2][0] = 0;
  gramSchmidt(mat, [[], [0], [0, 1]]);
  mat[3] = octonionProduct(mat[1], mat[2]);
  mat[4] = gaussianVector(8);
  mat[4][0] = 0;
  gramSchmidt(mat, [[], [], [], [], [0, 1, 2, 3]]);
  mat[5] = octonionProduct(mat[1], mat[4]);
  mat[6] = octonionProduct(mat[2], mat[4]);
  mat[7] = octonionProduct(mat[3], mat[4]);
  gramSchmidt(mat); // In principle, this should be useless
  return mat;
}

function matrixProduct(m, mm, storeP) {
  // Compute m*mm and possible store in storeP.
  // Note: storeP is allowed to be m (but not mm).
  var rows = m.length;
  var mid = mm.length;
  var cols = mm[0].length;
  if (typeof storeP === "undefined") storeP = new Array(rows);
  for (var i = 0; i < rows; i++) {
    var vec = new Array(cols);
    for (var j = 0; j < cols; j++) {
      vec[j] = 0;
      for (var k = 0; k < mid; k++) vec[j] += m[i][k] * mm[k][j];
    }
    storeP[i] = vec;
  }
  return storeP;
}

function transpose(m) {
  // Return transpose of a matrix
  var cols = m.length;
  var rows = m[0].length;
  var m2 = new Array(rows);
  for (var i = 0; i < rows; i++) {
    m2[i] = new Array(cols);
    for (var j = 0; j < cols; j++) m2[i][j] = m[j][i];
  }
  return m2;
}

function scalarMultiple(m, t) {
  var rows = m.length;
  var cols = m[0].length;
  var m2 = new Array(rows);
  for (var i = 0; i < rows; i++) {
    m2[i] = new Array(cols);
    for (var j = 0; j < cols; j++) m2[i][j] = m[i][j] * t;
  }
  return m2;
}

var e8ToOctMat = [
  [1 / 2, 0, 0, 0, 1 / 2, 0, 0, 0],
  [0, 1 / 2, 0, 0, 0, -1 / 2, 0, 0],
  [0, 0, 1 / 2, 0, 0, 0, -1 / 2, 0],
  [0, 0, 0, 1 / 2, 0, 0, 0, -1 / 2],
  [-1 / 2, 0, 0, 0, 1 / 2, 0, 0, 0],
  [0, 1 / 2, 0, 0, 0, 1 / 2, 0, 0],
  [0, 0, 1 / 2, 0, 0, 0, 1 / 2, 0],
  [0, 0, 0, 1 / 2, 0, 0, 0, 1 / 2],
];

function torusMat(t) {
  var phi = (1 + Math.sqrt(5)) / 2;
  var ca = Math.cos(t);
  var sa = Math.sin(t);
  var cb = Math.cos(phi * t);
  var sb = Math.sin(phi * t);
  var c2b = Math.cos(2 * phi * t);
  var s2b = Math.sin(2 * phi * t);
  return [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, ca * cb, sa * cb, 0, 0, ca * sb, sa * sb, 0],
    [0, -sa * cb, ca * cb, 0, 0, -sa * sb, ca * sb, 0],
    [0, 0, 0, c2b, 0, 0, 0, -s2b],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, -ca * sb, -sa * sb, 0, 0, ca * cb, sa * cb, 0],
    [0, sa * sb, -ca * sb, 0, 0, -sa * cb, ca * cb, 0],
    [0, 0, 0, s2b, 0, 0, 0, c2b],
  ];
}

// The two 8-vectors determining the projection to a plane:
// these should be normed and orthogonal.
// A third vector is used to determine the (Z-index) order of the dots.
var projMatrix0; // At t=0
var projMatrix;

var conjugator;
var conjugatorT;

var e8ToOctThenConjugator;
var e8ToOctThenConjugatorInv;

function initMatrices(standard) {
  projMatrix0 = new Array(2);
  projMatrix0[0] = [
    0.580162190775135, 0.240311047795148, 0.424708200277867, 0.0, -0.580162190775135,
    0.240311047795148, 0.0, 0.175919896606161,
  ];
  projMatrix0[1] = [
    0.580162190775135, 0.240311047795148, 0.0, 0.175919896606161, 0.580162190775135,
    -0.240311047795148, -0.424708200277867, 0.0,
  ];
  projMatrix0[2] = [1, 0, 0, 0, 0, 0, 0, 0];
  gramSchmidt(projMatrix0);
  if (standard) conjugator = identityMatrix(8);
  else conjugator = randomG2Matrix();
  conjugatorT = transpose(conjugator);
  e8ToOctThenConjugator = matrixProduct(e8ToOctMat, conjugator);
  e8ToOctThenConjugatorInv = scalarMultiple(transpose(e8ToOctThenConjugator), 2);
}

function computeProjectionMatrix(time) {
  var tMat = torusMat(time);
  projMatrix = matrixProduct(
    matrixProduct(matrixProduct(projMatrix0, e8ToOctThenConjugator), tMat),
    e8ToOctThenConjugatorInv
  );
}

var rootProj; // Projection of the roots (in canvas coordinates)
var rootZidx; // Z-index of the roots
var rootColor; // Root colors (RGB coordinates)

function computeRootProjections() {
  if (typeof rootProj === "undefined") {
    if (haveTypedArrays) {
      rootProj = new Float32Array(roots.length * 2);
      rootZidx = new Float32Array(roots.length);
    } else {
      rootProj = new Array(roots.length * 2);
      rootZidx = new Array(roots.length);
    }
  }
  for (var n = 0; n < roots.length; n++) {
    rootProj[2 * n] = dotprod(projMatrix[0], roots[n]) * 100 + 300;
    rootProj[2 * n + 1] = dotprod(projMatrix[1], roots[n]) * 100 + 300;
    rootZidx[n] = dotprod(projMatrix[2], roots[n]);
  }
}

function computeRootColors() {
  rootColor = new Array();
  for (var n = 0; n < roots.length; n++) {
    var x = dotprod(projMatrix0[0], roots[n]) / 2.83;
    var y = dotprod(projMatrix0[1], roots[n]) / 2.83;
    var hue = (Math.atan2(-y, x) / Math.PI + 1) * 3;
    var red;
    var grn;
    var blu;
    if (hue < 1) {
      red = 0;
      grn = 1;
      blu = hue;
    } else if (hue < 2) {
      red = 0;
      grn = 2 - hue;
      blu = 1;
    } else if (hue < 3) {
      red = hue - 2;
      grn = 0;
      blu = 1;
    } else if (hue < 4) {
      red = 1;
      grn = 0;
      blu = 4 - hue;
    } else if (hue < 5) {
      red = 1;
      grn = hue - 4;
      blu = 0;
    } else {
      red = 6 - hue;
      grn = 1;
      blu = 0;
    }
    var sat = Math.sqrt(x * x + y * y) * 0.9 + 0.1;
    red = sat * red + (1 - sat);
    grn = sat * grn + (1 - sat);
    blu = sat * blu + (1 - sat);
    var col = [
      Math.floor(red * 255 + 0.5),
      Math.floor(grn * 255 + 0.5),
      Math.floor(blu * 255 + 0.5),
    ];
    rootColor[n] = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
  }
}

var canvas;
var ctx;

function drawLines() {
  // Draw the 6720 edges.
  ctx.lineWidth = 0.2;
  ctx.strokeStyle = "rgb(0,0,0)";
  for (var n = 0; n < edges.length / 2; n++) {
    var i = edges[2 * n];
    var j = edges[2 * n + 1];
    ctx.beginPath();
    ctx.moveTo(rootProj[2 * i], rootProj[2 * i + 1]);
    ctx.lineTo(rootProj[2 * j], rootProj[2 * j + 1]);
    ctx.stroke();
  }
}

var rootZorder;

function drawPoints() {
  // Draw points.
  if (typeof rootZorder === "undefined") {
    rootZorder = new Array(roots.length);
    for (var k = 0; k < roots.length; k++) {
      rootZorder[k] = k;
    }
  }
  rootZorder.sort(function (k1, k2) {
    return rootZidx[k1] - rootZidx[k2];
  });
  for (var k = 0; k < roots.length; k++) {
    var n = rootZorder[k];
    ctx.fillStyle = rootColor[n];
    ctx.beginPath();
    ctx.arc(rootProj[2 * n], rootProj[2 * n + 1], 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }
}

function initCanvas() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

var requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;
var haveRequestAnimationFrame = typeof requestAnimationFrame === "function";

function now() {
  var d = new Date();
  return d.getTime();
}

var updateFunc;
var isRunning;
var animationStart;
var timeBase;
var doLines = false;

function computeAndDraw(time) {
  ctx.clearRect(0, 0, 600, 600);
  computeProjectionMatrix(time);
  computeRootProjections();
  if (doLines) drawLines();
  else {
    ctx.fillStyle = "rgb(128,128,128)";
    ctx.fillRect(0, 0, 600, 600);
  }
  drawPoints();
  var elt = document.getElementById("time");
  while (elt.firstChild) elt.removeChild(elt.firstChild);
  elt.appendChild(document.createTextNode(time.toFixed(3)));
}

function pauseButton() {
  if (!updateFunc) return;
  if (isRunning) {
    isRunning = false;
    timeBase = timeBase + (now() - animationStart) / 10000;
    computeAndDraw(timeBase);
  } else {
    isRunning = true;
    animationStart = now();
    if (haveRequestAnimationFrame) requestAnimationFrame(updateFunc, canvas);
    else updateFunc();
  }
}

function toggleLines() {
  if (!updateFunc) return;
  doLines = !doLines;
  if (!isRunning) computeAndDraw(timeBase);
}

function warpButton() {
  if (!updateFunc) return;
  var timeTarget = prompt("Time to warp to: ", "");
  if (timeTarget == null) return;
  timeBase = +timeTarget;
  animationStart = now();
  if (!isRunning) computeAndDraw(timeBase);
}

function resetButton(standard) {
  if (!updateFunc) return;
  initMatrices(standard);
  timeBase = 0;
  animationStart = now();
  if (!isRunning) computeAndDraw(timeBase);
}

function onLoad() {
  canvas = document.getElementById("canvas");
  if (typeof canvas.getContext != "function") {
    alert(
      "Your browser does not support the HTML5 <canvas> element.\n" + "This page will not function."
    );
    throw "canvas unsupported";
  }
  ctx = canvas.getContext("2d");
  createRoots();
  createEdges();
  initMatrices();
  initCanvas();
  computeRootColors();
  isRunning = true;
  timeBase = 0;
  updateFunc = function () {
    var time;
    if (!isRunning) return;
    if (typeof animationStart === "undefined") {
      animationStart = now();
      time = timeBase;
    } else {
      time = timeBase + (now() - animationStart) / 10000;
    }
    computeAndDraw(time);
    if (haveRequestAnimationFrame) requestAnimationFrame(updateFunc, canvas);
    else window.setTimeout(updateFunc, 40);
  };
  if (haveRequestAnimationFrame) requestAnimationFrame(updateFunc, canvas);
  else updateFunc();
}
