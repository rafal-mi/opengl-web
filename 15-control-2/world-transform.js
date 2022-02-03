class WorldTrans {
  constructor() {
    this._scale = 1.0;
    this._rotation = [0.0, 0.0, 0.0];
    this._position = [0.0, 0.0, 0.0];
  }

  setScale(s) {
    this._scale = s;
  }

  setRotation(x, y, z) {
    this._rotation = [x, y, z];
  }

  setPosition(x, y, z) {
    this._position = [x, y, z];
  }

  rotate(x, y, z) {
    this._rotation[0] += x;
    this._rotation[1] += y;
    this._rotation[2] += z;
  }

  get matrix() {
    let scale = new Matrix4f();
    scale.initScaleTransform(this._scale, this._scale, this._scale);

    let rotation = new Matrix4f();
    rotation.initRotateTransform(...this._rotation);

    let translation = new Matrix4f();
    translation.initTranslationTransform(...this._position);

    let worldTransformation = translation.multiply(rotation.multiply(scale));

    return worldTransformation;
  }
}
