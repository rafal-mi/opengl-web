let canvas = null;
let gl = null;
let VB0 = 0;
let IB0 = 0;
let shaderProgram = null;
let gWorldLocation = -1;
let scale = 0.0;

const renderSceneCb = (now) => {
  gl.clear(gl.COLOR_BUFFER_BIT);

  scale += 0.001;

  const world = [
    Math.cos(scale), -Math.sin(scale), 0.0, 0.0,
    Math.sin(scale), Math.cos(scale), 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ];

  // Necessary in WebGL 1 together with 'false' on second argument of 'uniformMatrix4fv'
  //
  //transpose1d(translation);

  gl.uniformMatrix4fv(
    gWorldLocation,
    true,
    new Float32Array(world)
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

  var positionAttribLocation = gl.getAttribLocation(shaderProgram, "position");
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.disableVertexAttribArray(positionAttribLocation);

  requestAnimationFrame(renderSceneCb);
};

class Vertex {
  pos = [];
  color = [];

  constructor(x, y) {
    const pos = [x, y, 0.0];

    const red = Math.random();
    const green = Math.random();
    const blue = Math.random();
    this.color = [red, green, blue];
  }
}

const createVertexBuffer = () => {
  const vertices = [];

  // Center
  vertices[0] = new Vertex(0.0, 0.0);

  // Top row
  vertices[1] = new Vertex(-1.0, 1.0);
  vertices[2] = new Vertex(-0.75, 1.0);
  vertices[3] = new Vertex(-0.50, 1.0);
  vertices[4] = new Vertex(-0.25, 1.0);
  vertices[5] = new Vertex(-0.0, 1.0);
  vertices[6] = new Vertex(0.25, 1.0);
  vertices[7] = new Vertex(0.50, 1.0);
  vertices[8] = new Vertex(0.75, 1.0);
  vertices[9] = new Vertex(1.0, 1.0);

  // Bottom row
  vertices[10] = new Vertex(-1.0, -1.0);
  vertices[11] = new Vertex(-0.75, -1.0);
  vertices[12] = new Vertex(-0.50, -1.0);
  vertices[13] = new Vertex(-0.25, -1.0);
  vertices[14] = new Vertex(-0.0, -1.0);
  vertices[15] = new Vertex(0.25, -1.0);
  vertices[16] = new Vertex(0.50, -1.0);
  vertices[17] = new Vertex(0.75, -1.0);
  vertices[18] = new Vertex(1.0, -1.0);

  const size = 24;
  const buffer = new ArrayBuffer(size * vertices.length);
  const dataView = new DataView(buffer);

  for (let i = 0; i < vertices.length; i++) {
    dataView.setFloat32(size * i, vertices[i].pos[0], true);
    dataView.setFloat32(size * i + 4, vertices[i].pos[1], true);
    dataView.setFloat32(size * i + 8, vertices[i].pos[1], true);
    dataView.setFloat32(size * i + 12, vertices[i].color[0], true);
    dataView.setFloat32(size * i + 16, vertices[i].color[1], true);
    dataView.setFloat32(size * i + 20, vertices[i].color[1], true);
  }

  VBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
};

const createIndexBuffer = () => {
  const indices = [
    // Top triangles
    0, 2, 1,
    0, 3, 2,
    0, 4, 3,
    0, 5, 4,
    0, 6, 5,
    0, 7, 6,
    0, 8, 7,
    0, 9, 8,

    // Bottom triangles
    0, 10, 11,
    0, 11, 12,
    0, 12, 13,
    0, 13, 14,
    0, 14, 15,
    0, 15, 16,
    0, 16, 17,
    0, 17, 18,

    // Left triangle
    0, 1, 10,

    // Right triangle
    0, 18, 9
  ];

  const size = 4;
  const buffer = new ArrayBuffer(size * indices.length);
  const dataView = new DataView(buffer);

  for (let i = 0; i < indices.length; i++) {
    dataView.setFloat32(size * i, indices[i], true);
  }

  glGenBuffers(1, IBO);
  glBindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
  glBufferData(gl.ELEMENT_ARRAY_BUFFER, indices, GL_STATIC_DRAW);

}

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

  gWorldLocation = gl.getUniformLocation(shaderProgram, "gWorld");
  console.assert(gWorldLocation !== 0xFFFFFFFF);
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
