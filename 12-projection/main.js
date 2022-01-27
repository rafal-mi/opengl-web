let canvas = null;
let gl = null;
let VB0 = 0;
let IB0 = 0;
let shaderProgram = null;
let gWorldLocation = -1;
let scale = 0.0;

const SIZE_OF_INT = 4;

const renderSceneCb = (now) => {
  gl.clear(gl.COLOR_BUFFER_BIT);

  scale += 0.01;

  const rotation = [
    Math.cos(scale), 0.0, -Math.sin(scale), 0.0,
    0.0, 1.0, 0.0, 0.0,
    Math.sin(scale), 0.0, Math.cos(scale), 0.0,
    0.0, 0.0, 0.0, 1.0
  ];

  const translation = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 1.5,
    0.0, 0.0, 0.0, 1.0
  ];

  const FOV = 90.0;
  const tanHalfFOV = Math.tan(toRadian(FOV / 2.0));
  const f = 1 / tanHalfFOV;

  const projection = [
      f, 0.0, 0.0, 0.0,
    0.0,   f, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 1.0, 0.0
  ];

  const finalMatrix = 
    matrixProduct(projection, 
      matrixProduct(translation, rotation, 4, 4, 4), 
      4, 4, 4); 

  //printMatrix4d(finalMatrix);

  gl.uniformMatrix4fv(
    gWorldLocation,
    true,
    new Float32Array(finalMatrix)
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);

  // position
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0);

  // position
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_INT, 0);

  gl.disableVertexAttribArray(0);
  gl.disableVertexAttribArray(1);

  requestAnimationFrame(renderSceneCb);
  //setTimeout(() => requestAnimationFrame(renderSceneCb), 500);
  
};

class Vertex {
  pos = [];
  color = [];

  constructor(x, y, z) {
    this.pos = [x, y, z];

    const red = Math.random();
    const green = Math.random();
    const blue = Math.random();
    this.color = [red, green, blue];
  }
}

const createVertexBuffer = () => {
  const vertices = Array(8);

  vertices[0] = new Vertex(0.5, 0.5, 0.5);
  vertices[1] = new Vertex(-0.5, 0.5, -0.5);
  vertices[2] = new Vertex(-0.5, 0.5, 0.5);
  vertices[3] = new Vertex(0.5, -0.5, -0.5);
  vertices[4] = new Vertex(-0.5, -0.5, -0.5);
  vertices[5] = new Vertex(0.5, 0.5, -0.5);
  vertices[6] = new Vertex(0.5, -0.5, 0.5);
  vertices[7] = new Vertex(-0.5, -0.5, 0.5);

  const size = 24;
  const buffer = new ArrayBuffer(size * vertices.length);
  const dataView = new DataView(buffer);

  for (let i = 0; i < vertices.length; i++) {
    dataView.setFloat32(size * i, vertices[i].pos[0], true);
    dataView.setFloat32(size * i + 4, vertices[i].pos[1], true);
    dataView.setFloat32(size * i + 8, vertices[i].pos[2], true);
    dataView.setFloat32(size * i + 12, vertices[i].color[0], true);
    dataView.setFloat32(size * i + 16, vertices[i].color[1], true);
    dataView.setFloat32(size * i + 20, vertices[i].color[2], true);
  }

  VBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
};

const createIndexBuffer = () => {
  const indices = [
    0, 1, 2,
    1, 3, 4,
    5, 6, 3,
    7, 3, 6,
    2, 4, 7,
    0, 7, 6,
    0, 5, 1,
    1, 5, 3,
    5, 0, 6,
    7, 4, 3,
    2, 1, 4,
    0, 2, 7
  ];

  const size = 4;
  const buffer = new ArrayBuffer(size * indices.length);
  const dataView = new DataView(buffer);

  for (let i = 0; i < indices.length; i++) {
    dataView.setInt32(size * i, indices[i], true);
  }

  IBO = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

}

const addShader = (shaderProgram, pShaderText, shaderType) => {
  const shaderObj = gl.createShader(shaderType);
  gl.shaderSource(shaderObj, pShaderText);
  gl.compileShader(shaderObj);
  if (!gl.getShaderParameter(shaderObj, gl.COMPILE_STATUS)) {
    var infoLog = gl.getShaderInfoLog(shaderObj);
    var msg = `Shader failed to compile.  The er,ror log is ${infoLog}`;
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

  gl.bindAttribLocation(shaderProgram, 0, 'inPosition');
  gl.bindAttribLocation(shaderProgram, 1, 'inColor');

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

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 0.5);

  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CW);
  gl.cullFace(gl.BACK);

  createVertexBuffer();
  createIndexBuffer();

  compileShaders();

  requestAnimationFrame(renderSceneCb);
};

main();
