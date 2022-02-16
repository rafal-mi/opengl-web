const toRadian = x => (x * Math.PI) / 180.0;
const toDegree = x => x * 180.0 / Math.PI;

class Vector2i {
  x = 0;
  y = 0;
}

class Vector2f {
  x = 0;
  y = 0;

  constructor(x_, y_) {
    if(x !== undefined) {
      this.x = x_;
      this.y = y_;
    }
  }
}

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

  rotate(angle, V) {
    const rotationQ = new Quaternion(angle, V);
    const conjugateQ = rotationQ.conjugate();
    const W = rotationQ.multiplyByVector(this).multiply(conjugateQ);

    this.x = W.x;
    this.y = W.y;
    this.z = W.z;
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

class Quaternion {
  constructor() {
    if(arguments.length === 2) {
      this._angle = arguments[0];
      this._V = arguments[1];

      const halfAngleInRadians = toRadian(this._angle / 2);
      const sineHalfAngle = Math.sin(halfAngleInRadians);
      const cosHalfAngle = Math.cos(halfAngleInRadians);

      const V = this._V;
      this._x = V.x * sineHalfAngle;
      this._y = V.y * sineHalfAngle;
      this._z = V.z * sineHalfAngle;
      this._w = cosHalfAngle;
    } else {
      this._x = arguments[0];
      this._y = arguments[1];
      this._z = arguments[2];
      this._w = arguments[3];
    }
  }

  get x() { return this._x }
  get y() { return this._y }
  get z() { return this._z }
  get w() { return this._w }

  normalize() {
    const length = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);

    this._x /= length;
    this._y /= length;
    this._z /= length;
    this._w /= length;
  }

  conjugate() {
    const ret = new Quaternion(-this._x, -this._y, -this._z, this._w);
    return ret;
  }

  multiplyByVector(v) {
    const w = -(this.x * v.x) - (this.y * v.y) - (this.z * v.z);
    const x = (this.w * v.x) + (this.y * v.z) - (this.z * v.y);
    const y = (this.w * v.y) + (this.z * v.x) - (this.x * v.z);
    const z = (this.w * v.z) + (this.x * v.y) - (this.y * v.x);

    const ret = new Quaternion(x, y, z, w);
    return ret;
  }

  multiply(that) {
    const w = (this.w * that.w) - (this.x * that.x) - (this.y * that.y) - (this.z * that.z);
    const x = (this.x * that.w) + (this.w * that.x) + (this.y * that.z) - (this.z * that.y);
    const y = (this.y * that.w) + (this.w * that.y) + (this.z * that.x) - (this.x * that.z);
    const z = (this.z * that.w) + (this.w * that.z) + (this.x * that.y) - (this.y * that.x);

    const ret = new Quaternion(x, y, z, w);
    return ret;
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
