export interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
    vertexColor: number;
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation;
    modelViewMatrix: WebGLUniformLocation;
  };
}

interface Buffers {
  position: WebGLBuffer;
  color: WebGLBuffer;
}
// creates/compiles shader object
const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("Unable to create a WebGL shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // error
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = "shader could not compile: " + gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
};

// initialises a shader program so webgl can draw the data
export const initShaderProgram = (
  gl: WebGLRenderingContext,
  vertCode: string,
  fragCode: string
): WebGLProgram => {
  // create shader objects, type is WebGLShader
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertCode);
  let fragmentShader: WebGLShader | null = null;
  let shaderProgram: WebGLProgram | null = null;

  try {
    fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragCode);
    shaderProgram = gl.createProgram();
    if (shaderProgram === null) {
      throw new Error("Unable to create a WebGL program");
    }
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error("shader program could not link: " + gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram;
  } catch (error) {
    if (shaderProgram !== null) gl.deleteProgram(shaderProgram);
    throw error;
  } finally {
    gl.deleteShader(vertexShader);
    if (fragmentShader !== null) gl.deleteShader(fragmentShader);
  }
};

export const initBuffers = (gl: WebGLRenderingContext): Buffers => {
  // prettier-ignore
  const colors = [
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  0.0,  0.0,  1.0,    // red
    0.0,  1.0,  0.0,  1.0,    // green
    0.0,  0.0,  1.0,  1.0,    // blue
  ];

  const colorBuffer = gl.createBuffer();
  if (colorBuffer === null) {
    throw new Error("Unable to create the WebGL color buffer");
  }

  // prettier-ignore
  const positions = [
    1.0,  1.0, 0.0,
   -1.0,  1.0, 0.0,
    1.0, -1.0, 0.0,
   -1.0, -1.0, 0.0,
 ];

  let positionBuffer: WebGLBuffer | null = null;
  try {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    positionBuffer = gl.createBuffer();
    if (positionBuffer === null) {
      throw new Error("Unable to create the WebGL position buffer");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return { position: positionBuffer, color: colorBuffer };
  } catch (error) {
    gl.deleteBuffer(colorBuffer);
    if (positionBuffer !== null) gl.deleteBuffer(positionBuffer);
    throw error;
  }
};

export const draw = (gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: Buffers) => {
  gl.clearColor(0.0, 0.0, 0.1, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST); // enable depth testing
  gl.depthFunc(gl.LEQUAL); // near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fov = (45 * Math.PI) / 180; // in radians
  const f = 1.0 / Math.tan(fov / 2);
  const canvas = gl.canvas;
  const hasDisplaySize = "clientWidth" in canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0;
  const width = hasDisplaySize ? canvas.clientWidth : canvas.width;
  const height = hasDisplaySize ? canvas.clientHeight : canvas.height;
  if (width <= 0 || height <= 0) return;
  const aspect = width / height;
  const zNear = 1;
  const zFar = 100.0;
  const nf = 1 / (zNear - zFar);
  // prettier-ignore
  const projectionArray = [
    f/aspect, 0,  0,                0,
    0,        f,  0,                0,
    0,        0,  zFar*nf, (zFar*zNear)*nf, // convention is negative z
    0,        0, -1,                0
  ]
  const projectionMatrix = new Float32Array(projectionArray);
  // typed arrays tend to be faster in this application, and webgl takes typed arrays anyways
  // i think converting from normal array to typed array is costly, so this jank works for now

  // set draw position -6 in z
  // prettier-ignore
  const modelViewArray = [
    -1, 0,  0, 0,
    0, 1,  0, 0,
    0, 0,  -6, 0,
    0, 0,  0,  1
  ]
  const modelViewMatrix = new Float32Array(modelViewArray);

  // tell WebGL how to get positions from buffer into vertexPosition
  {
    const numComponents = 3; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }
  // tell WebGL how to get colors from buffer into vertexColor
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  gl.useProgram(programInfo.program);

  // set the shader uniforms

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
};
