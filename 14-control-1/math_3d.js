const toRadian = (x) => (x * Math.PI) / 180.0;

class Vector3f {
  constructor(...args) {
    this._vector = args;
  }

  get vector() {
    return this._vector;
  }

  get x() {
    return this._vector[0];
  }

  set x(value) {
    this._vector[0] = value;
  }

  get y() {
    return this._vector[1];
  }

  set y(value) {
    this._vector[1] = value;
  }

  get z() {
    return this._vector[2];
  }

  set z(value) {
    this._vector[2] = value;
  }

  add(that) {
    for (let i = 0; i < 3; i++) this._vector[i] += that._vector[i];
    return this;
  }

  subtract(that) {
    for (let i = 0; i < 3; i++) this._vector[i] -= that._vector[i];
    return this;
  }

  multiply(scalar) {
    const v = [...this._vector];
    v[0] *= scalar;
    v[1] *= scalar;
    v[2] *= scalar;

    return new Vector3f(...v);
  }

  cross(that) {
    const u = this;
    const v = that;

    const _x = u.y * v.z - u.z * v.y;
    const _y = u.z * v.x - u.x * v.z;
    const _z = u.x * v.y - u.y * v.x;

    return new Vector3f(_x, _y, _z);
  }

  normalize() {
    const u = this;
    const length = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);

    console.assert(length > 0, "Zero-length vector");

    const v = u.vector;
    v[0] /= length;
    v[1] /= length;
    v[2] /= length;
  }
}

class PersProjInfo {
  FOV = 45.0;
  width = 640.0;
  height = 640.0;
  zNear = 1.0;
  zFar = 10.0;

  constructor(FOV, width, height, zNear, zFar) {
    this.FOV = FOV;
    this.width = width;
    this.height = height;
    this.zNear = zNear;
    this.zFar = zFar;
  }
}

class Matrix4f {
  constructor() {
    this._matrix = [
      [1.0, 0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0, 0.0],
      [0.0, 0.0, 1.0, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ];
    if (!arguments.length || !Array.isArray(arguments[0])) {
      return;
    }
    const a = arguments[0];
    const nested = Array.isArray(a[0]);
    const n = 4;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this._matrix[i][j] = nested ? a[i][j] : a[i * n + j];
      }
    }
  }

  get matrix() {
    return this._matrix;
  }

  get flat() {
    return this._matrix.flat();
  }

  multiply(that) {
    let A = math.matrix(this.matrix);
    let B = math.matrix(that.matrix);
    let C = math.multiply(A, B);
    return new Matrix4f(C._data);
  }

  initScaleTransform(x, y, z) {
    this._matrix = [
      [x, 0.0, 0.0, 0.0],
      [0.0, y, 0.0, 0.0],
      [0.0, 0.0, z, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ];
  }

  initRotationX(x) {
    let s = Math.sin(x);
    let c = Math.cos(x);
    this._matrix = [
      [1.0, 0.0, 0.0, 0.0],
      [0.0, c, -s, 0.0],
      [0.0, s, c, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ];
  }

  initRotationY(y) {
    let s = Math.sin(y);
    let c = Math.cos(y);
    this._matrix = [
      [c, 0.0, -s, 0.0],
      [0.0, 1.0, 0.0, 0.0],
      [s, 0.0, c, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ];
  }

  initRotationZ(z) {
    let s = Math.sin(z);
    let c = Math.cos(z);
    this._matrix = [
      [c, -s, 0.0, 0.0],
      [s, c, 0.0, 0.0],
      [0.0, 0.0, 1.0, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ];
  }

  initRotateTransform(rotateX, rotateY, rotateZ) {
    let rx = new Matrix4f();
    let ry = new Matrix4f();
    let rz = new Matrix4f();

    let x = toRadian(rotateX);
    let y = toRadian(rotateY);
    let z = toRadian(rotateZ);

    rx.initRotationX(x);
    ry.initRotationY(y);
    rz.initRotationZ(z);

    this._matrix = rx.multiply(ry.multiply(rz)).matrix;
  }

  initTranslationTransform(x, y, z) {
    this._matrix = [
      [1.0, 0.0, 0.0, x],
      [0.0, 1.0, 0.0, y],
      [0.0, 0.0, 1.0, z],
      [0.0, 0.0, 0.0, 1.0],
    ];
  }

  initCameraTransform2Args(target, up) {
    const N = target;
    N.normalize();

    const U = up.cross(N);
    U.normalize();

    const V = N.cross(U);

    this._matrix = [
      [U.x, U.y, U.z, 0.0],
      [V.x, V.y, V.z, 0.0],
      [N.x, N.y, N.z, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ];
  }

  initCameraTransform(pos, target, up) {
    const cameraTranslation = new Matrix4f();
    cameraTranslation.initTranslationTransform(-pos.x, -pos.y, -pos.z);

    const cameraRotateTrans = new Matrix4f();
    cameraRotateTrans.initCameraTransform2Args(target, up);

    this._matrix = cameraRotateTrans.multiply(cameraTranslation).matrix;
  }

  initPersProjTransform(p) {
    const ar = p.width / p.height;
    const zRange = p.zNear - p.zFar;
    const tanHalfFOV = Math.tan(toRadian(p.FOV / 2.0));

    this._matrix = [
      [1.0 / (tanHalfFOV * ar),  0.0,               0.0,                           0.0                            ],
      [0.0,                      1.0 / tanHalfFOV,  0.0,                           0.0                            ],
      [0.0,                      0.0,               (-p.zNear - p.zFar) / zRange,  2.0 * p.zFar * p.zNear / zRange],
      [0.0,                      0.0,               1.0,                           0.0                            ]
    ];
  }
}
