// code imported from project I did ~2 years ago

// creates a certain type of shader, attaches the code, and compiles
function createShader(gl, type, source) {
  var shader = gl.createShader(type);

  // send code to shader object
  gl.shaderSource(shader, source);

  // compile shader shaderProgram
  gl.compileShader(shader);

  // error
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("shader could not compile: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// initialises a shader program so webgl can draw the data
export function initShaderProgram(gl, vertCode, fragCode) {
  // create shader shaderProgram and attach/link shaders
  var shaderProgram = gl.createProgram();

  // attach source code
  var vertShader = loadShader(gl, gl.VERTEX_SHADER, vertCode);
  var fragShader = loadShader(gl, gl.FRAGMENT_SHADER, fragCode);

  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("shader could not link: \n" + gl.getProgramInfoLog(shaderProgram));
    return null;
    throw new Error(gl.getProgramInfoLog(shaderProgram));
  }

  // error message
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    // if shader program isnt linked
    alert("shaders could not link: \n" + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  const wrapper = { shaderProgram: shaderProgram };

  const numAttributes = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttributes; i++) {
    const attribute = gl.getActiveAttrib(shaderProgram, i);
    wrapper[attribute.name] = gl.getAttribLocation(shaderProgram, attribute.name);
  }
  const numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; i++) {
    const uniform = gl.getActiveUniform(shaderProgram, i);
    wrapper[uniform.name] = gl.getUniformLocation(shaderProgram, uniform.name);
  }

  return wrapper;
  console.log(wrapper);
}

export function createTexture(gl, filter, data, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  if (data instanceof Uint8Array) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

export function bindTexture(gl, texture, unit) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

export function createBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

export function bindAttribute(gl, buffer, attribute, numComponents) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
}

export function bindFramebuffer(gl, framebuffer, texture) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  if (texture) {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }
}
