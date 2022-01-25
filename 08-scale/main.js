let canvas = null;
let gl = null;
let VB0 = 0;
let shaderProgram = null;
let gScalingLocation = -1;
let scale = 1.0;
let delta = 0.002;

const renderSceneCb = (now) => {
  gl.clear(gl.COLOR_BUFFER_BIT);

  scale += delta;
  if (scale >= 1.5 || scale <= 0.5) {
    delta *= -1.0;
  }

  const scaling = [
    scale, 0.0, 0.0, 0.0,
    0.0, scale, 0.0, 0.0,
    0.0, 0.0, scale, 0.0,
    0.0, 0.0, 0.0, 1.0
  ];

  // Necessary in WebGL 1 together with 'false' on second argument of 'uniformMatrix4fv'
  //
  //transpose1d(translation);

  gl.uniformMatrix4fv(
    gScalingLocation,
    true,
    new Float32Array(scaling)
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

  var positionAttribLocation = gl.getAttribLocation(shaderProgram, "position");
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.disableVertexAttribArray(positionAttribLocation);

  requestAnimationFrame(renderSceneCb);
};

const createVertexBuffer = () => {
  vertices = [
    -0.5, -0.5,  0.0, // bottom left
     0.5, -0.5,  0.0, // bottom right
     0.0,  0.5,  0.0, // top
  ];

  VBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
};

const addShader = (shaderProgram, pShaderText, shaderType) => {
  const shaderObj = gl.createShader(shaderType);
  gl.shaderSource(shaderObj, pShaderText);
  gl.compileShader(shaderObj);
  if (!gl.getShaderParameter(shaderObj, gl.COMPILE_STATUS)) {
    var infoLog = gl.getShaderInfoLog(shaderObj);
    var msg = `Shader failed to compile.  The error log is ${infoLog}`;
    +console.error(msg);
    return -1;
  }
  gl.attachShader(shaderProgram, shaderObj);
};

const compileShaders = () => {
  shaderProgram = gl.createProgram();
  var vs = document.getElementById("vertex-shader").text;
  addShader(shaderProgram, vs, gl.VERTEX_SHADER);
  var fs = document.getElementById("fragment-shader").text;
  addShader(shaderProgram, fs, gl.FRAGMENT_SHADER);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(shaderProgram);
    throw new Error("Could not compile WebGL program. \n\n" + info);
  }

  gScalingLocation = gl.getUniformLocation(shaderProgram, "gScaling");
  if (gScalingLocation === -1) {
    throw new Error(`Error getting uniform location of 'gScaling'`);
  }

  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(shaderProgram);
    throw "Could not compile WebGL program. \n\n" + info;
  }

  gl.useProgram(shaderProgram);
};

const main = () => {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");

  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 0.5);

  createVertexBuffer();

  compileShaders();

  requestAnimationFrame(renderSceneCb);
};

main();
