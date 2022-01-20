let canvas = null;
let gl = null;
let VB0 = 0;
let shaderProgram = null;

const renderSceneCb = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

  var coord = gl.getAttribLocation(shaderProgram, "coordinates");
  gl.enableVertexAttribArray(coord);
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.POINTS, 0, 1);

  gl.disableVertexAttribArray(coord);
};

const createVertexBuffer = () => {
  vertices = [0.0, 0.0, 0.0];

  VBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
};

const useShaders = () => {
  // Copyright Tutorialspoint

  // vertex shader source code
  var vertCode = `
    attribute vec3 coordinates;
    void main(void) {
        gl_Position = vec4(coordinates, 1.0);
        gl_PointSize = 10.0;
    }
  `;

  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode);

  // Compile the vertex shader
  gl.compileShader(vertShader);

  // fragment shader source code
  var fragCode =
    "void main(void) {" + " gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);" + "}";

  // Create fragment shader object
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragCode);

  // Compile the fragmentt shader
  gl.compileShader(fragShader);

  // Create a shader program object to store
  // the combined shader program
  shaderProgram = gl.createProgram();

  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader);

  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader);

  // Link both programs
  gl.linkProgram(shaderProgram);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);
};

const mainOglDev = () => {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl");

  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  createVertexBuffer();

  useShaders();

  renderSceneCb();
};

mainOglDev();
