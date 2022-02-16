let canvas = null;
let gl = null;
let VB0 = 0;
let IB0 = 0;
let shaderProgram = null;
let gWVPLocation = -1;
let gSamplerLocation = -1;
let pTexture = null;

let cubeWorldTransform = null;
let cameraPos = new Vector3f(0.0, 0.0, -1.0);
let cameraTarget = new Vector3f(0.0, 0.0, 1.0);
let cameraUp = new Vector3f(0.0, 1.0, 0.0);
let gameCamera = null;
let yRotationAngle = 1.0;

const FOV = 45.0;
const zNear = 1.0;
const zFar = 10.0;
let persProjInfo = null;

const SIZE_OF_INT = 4;

const renderSceneCb = (now) => {
  gl.clear(gl.COLOR_BUFFER_BIT);

  gameCamera.onRender();

  // let yRotationAngle = 0.1;

  cubeWorldTransform.setPosition(0.0, 0.0, 2.0);
  cubeWorldTransform.rotate(0.0, yRotationAngle, 0.0);
  const world = cubeWorldTransform.matrix;
  
  const view = gameCamera.matrix;

  const projection = new Matrix4f();
  projection.initPersProjTransform(persProjInfo);

  const WVP = projection.multiply(view.multiply(world));
  const matrix = WVP.matrix;
  const array = matrix.flat();

  gl.uniformMatrix4fv(gWVPLocation, true, new Float32Array(array));

  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);

  pTexture.bind(gl.TEXTURE0);
  gl.uniform1i(gSamplerLocation, 0);

  // position
  const sizeOf = 4;
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * sizeOf, 0);

  // tex coords
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * sizeOf, 3 * sizeOf);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_INT, 0);

  gl.disableVertexAttribArray(0);
  gl.disableVertexAttribArray(1);

  requestAnimationFrame(renderSceneCb);
  // setTimeout(() => requestAnimationFrame(renderSceneCb), 3000);
};

class Vertex {
  pos = [];
  tex = [];

  constructor(pos_, tex_) {
    this.pos = pos_;
    this.tex = tex_;
  }
}

const createVertexBuffer = () => {
  const vertices = Array(8);

  const t00 = [0.0, 0.0];
  const t01 = [0.0, 1.0];
  const t10 = [1.0, 0.0];
  const t11 = [1.0, 1.0];

  vertices[0] = new Vertex([0.5, 0.5, 0.5], t00);
  vertices[1] = new Vertex([-0.5, 0.5, -0.5], t01);
  vertices[2] = new Vertex([-0.5, 0.5, 0.5], t10);
  vertices[3] = new Vertex([0.5, -0.5, -0.5], t11);
  vertices[4] = new Vertex([-0.5, -0.5, -0.5], t00);
  vertices[5] = new Vertex([0.5, 0.5, -0.5], t10);
  vertices[6] = new Vertex([0.5, -0.5, 0.5], t01);
  vertices[7] = new Vertex([-0.5, -0.5, 0.5], t11);

  const size = 20;
  const buffer = new ArrayBuffer(size * vertices.length);
  const dataView = new DataView(buffer);

  for (let i = 0; i < vertices.length; i++) {
    dataView.setFloat32(size * i, vertices[i].pos[0], true);
    dataView.setFloat32(size * i + 4, vertices[i].pos[1], true);
    dataView.setFloat32(size * i + 8, vertices[i].pos[2], true);
    dataView.setFloat32(size * i + 12, vertices[i].tex[0], true);
    dataView.setFloat32(size * i + 16, vertices[i].tex[1], true);
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
    0, 2, 7,
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
};

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

  gl.bindAttribLocation(shaderProgram, 0, "inPosition");
  gl.bindAttribLocation(shaderProgram, 1, "inTexCoord");

  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(shaderProgram);
    throw new Error("Could not compile WebGL program. \n\n" + info);
  }

  gWVPLocation = gl.getUniformLocation(shaderProgram, "gWVP");
  if(gWVPLocation === -1) {
    throw "Errorgettint uniform location of 'gWVP'";
  }

  gSamplerLocation = gl.getUniformLocation(shaderProgram, "gSampler");
  if(gSamplerLocation === -1) {
    throw "Errorgettint uniform location of 'gSampler'";
  }

  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(shaderProgram);
    throw "Could not compile WebGL program. \n\n" + info;
  }

  gl.useProgram(shaderProgram);
};

const simulateMouse = horizontal => {
  if(horizontal) {
    setTimeout(() => { 
      gameCamera.onMouse(635, 320);
      setTimeout(() => {
        gameCamera.onMouse(635, 330);
      }, 3000);
    }, 3000);

    return;
  }

  const w2 = canvas.width / 2;
  const h = canvas.height;
  const positions = [
    [w2, 5],
    [w2 + 5, 5],
    [w2, h - 5],
    [w2 + 5, h - 5],
    [w2, h / 2],
    [w2 + 5, h / 2]
  ];

  let i = 0;
  const interval = setInterval(() => {
    gameCamera.onMouse(positions[i][0], positions[i][1]);
    i++;
    if(i >= positions.length) {
      clearInterval(interval);
    }
  }, 3000);

}

const main = async () => {
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


  pTexture = new Texture(gl.TEXTURE_2D, "texImage");

  if (!pTexture.load()) {
      return 1;
  }


  cubeWorldTransform = new WorldTrans();
  gameCamera = new Camera(canvas.width, canvas.height, cameraPos, cameraTarget, cameraUp);

  persProjInfo = new PersProjInfo(FOV, canvas.width, canvas.height, zNear, zFar);

  requestAnimationFrame(renderSceneCb);

  document.addEventListener('keydown', event => {
    console.log(event);
    gameCamera.onKeyboard(event);
  });

  // Either...
  //
  canvas.addEventListener('mousemove', event => {
    gameCamera.onMouse(event.offsetX, event.offsetY);
  });
  //

  // ...or
  //
  // simulateMouse(false);

};

main();
