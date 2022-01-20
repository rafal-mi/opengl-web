let gl = null;
let VB0 = 0;

const renderSceneCb = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);
};

const createVertexBuffer = () => {
  vertices = [0.0, 0.0, 0.0];
  VBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
};

const mainOglDev = () => {
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl");

  createVertexBuffer();

  renderSceneCb();
};

mainOglDev();
