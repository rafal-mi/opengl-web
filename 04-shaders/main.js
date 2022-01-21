let canvas = null;
let gl = null;
let VB0 = 0;
let shaderProgram = null;

const renderSceneCb = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

  var positionAttribLocation = gl.getAttribLocation(shaderProgram, "position");
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.disableVertexAttribArray(positionAttribLocation);
};

const createVertexBuffer = () => {
  vertices = [
    -1.0,
    -1.0,
    0.0, // bottom left
    1.0,
    -1.0,
    0.0, // bottom right
    0.0,
    1.0,
    0.0, // top
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

  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(shaderProgram);
    throw "Could not compile WebGL program. \n\n" + info;
  }

  gl.useProgram(shaderProgram);
};

const main = () => {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl");

  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 0.5);

  createVertexBuffer();

  compileShaders();

  renderSceneCb();
};

main();
