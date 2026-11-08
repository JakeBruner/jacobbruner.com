// WebGL shader programs
const vertexShaderSource = `#version 300 es
  in vec4 a_position;
  in float a_pressure;
  
  uniform mat4 u_matrix;
  
  out float v_pressure;
  
  void main() {
    gl_Position = u_matrix * a_position;
    v_pressure = a_pressure;
  }
`;

const fragmentShaderSource = `#version 300 es
  precision highp float;
  
  in float v_pressure;
  uniform vec4 u_color;
  
  out vec4 outColor;
  
  void main() {
    // Color based on pressure value
    float pressure = clamp(v_pressure, -1.0, 1.0);
    vec3 color;
    if (pressure > 0.0) {
      color = mix(vec3(0.5), vec3(0.0, 0.5, 1.0), pressure);
    } else {
      color = mix(vec3(0.5), vec3(1.0, 0.0, 0.0), -pressure);
    }
    outColor = vec4(color, 1.0);
  }
`;

let gl: WebGL2RenderingContext | null = null;
let program: WebGLProgram | null = null;
let positionAttributeLocation = -1;
let pressureAttributeLocation = -1;
let matrixLocation: WebGLUniformLocation | null = null;
let colorLocation: WebGLUniformLocation | null = null;
let startTime = 0;

export function setupWebGL(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
    const context = canvas.getContext('webgl2');
    if (!context) {
        console.error('WebGL2 not supported');
        return null;
    }

    context.clearColor(0.0, 0.0, 0.0, 0.0);
    context.enable(context.BLEND);
    context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
    context.clear(context.COLOR_BUFFER_BIT);

    return context;
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
        console.error('Failed to create shader');
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) {
        console.error('Failed to create program');
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

export function initWebGLContext(context: WebGL2RenderingContext): boolean {
    try {
        gl = context;
        startTime = performance.now();

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            throw new Error('Failed to create shaders');
        }

        program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) {
            throw new Error('Failed to create program');
        }

        gl.useProgram(program);

        // Get attribute locations
        positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        pressureAttributeLocation = gl.getAttribLocation(program, 'a_pressure');

        if (positionAttributeLocation === -1 || pressureAttributeLocation === -1) {
            throw new Error('Failed to get attribute locations');
        }

        // Get uniform locations
        matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        colorLocation = gl.getUniformLocation(program, 'u_color');

        if (!matrixLocation || !colorLocation) {
            throw new Error('Failed to get uniform locations');
        }

        return true;
    } catch (error) {
        console.error('Failed to initialize WebGL:', error);
        return false;
    }
}

export function setupCanvas(canvas: HTMLCanvasElement) {
    if (!gl || !program || !matrixLocation) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // Set up projection matrix
    const aspect = canvas.width / canvas.height;
    const projectionMatrix = [
        2 / aspect, 0, 0, 0,
        0, -2, 0, 0,
        0, 0, 1, 0,
        -1, 1, 0, 1
    ];
    
    gl.uniformMatrix4fv(matrixLocation, false, projectionMatrix);
}

function createModeBuffer(mode: number[][], points: number[][], currentTime: number): WebGLBuffer | null {
    if (!gl) return null;

    const buffer = gl.createBuffer();
    if (!buffer) return null;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    
    const vertices: number[] = [];
    const N = mode.length;
    
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const x = (points[i][0] * 2) - 1;
            const y = (points[j][1] * 2) - 1;
            const pressure = mode[i][j] * Math.sin(currentTime * 0.005);
            vertices.push(x, y, 0, pressure);
        }
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return buffer;
}

export function drawShape(points: number[][], harmonics: { frequency: number; amplitude: number; mode: number[][] }[]) {
    if (!gl || !program || !matrixLocation || !colorLocation || harmonics.length === 0) return;
    
    const currentTime = performance.now() - startTime;
    
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Draw the current mode shape
    const activeMode = Math.floor((currentTime / 2000) % harmonics.length);
    const currentMode = harmonics[activeMode];
    
    if (!currentMode?.mode) return;
    
    const modeBuffer = createModeBuffer(currentMode.mode, points, currentTime);
    if (!modeBuffer) return;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, modeBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(pressureAttributeLocation);
    
    const stride = 4 * 4; // 4 floats per vertex (x, y, z, pressure)
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(pressureAttributeLocation, 1, gl.FLOAT, false, stride, 12);
    
    // Draw the pressure field
    gl.drawArrays(gl.POINTS, 0, points.length * points.length);
    
    // Draw shape outline
    const shapeBuffer = gl.createBuffer();
    if (!shapeBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    const shapeVertices = new Float32Array(points.flatMap(p => [...p, 0, 0]));
    gl.bufferData(gl.ARRAY_BUFFER, shapeVertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(pressureAttributeLocation, 1, gl.FLOAT, false, 16, 12);
    gl.uniform4fv(colorLocation, [0.6, 0.7, 0.8, 1]);
    
    gl.drawArrays(gl.LINE_STRIP, 0, points.length);
    
    requestAnimationFrame(() => drawShape(points, harmonics));
}
