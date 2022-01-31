class Camera {
  constructor() {
    this._position = new Vector3f(0.0, 0.0, 0.0);
    this._target = new Vector3f(0.0, 0.0, 1.0);
    this._up = new Vector3f(0.0, 1.0, 0.0);
    this._speed = 1.0;
  }

  setPosition(x, y, z) {
    this._position.x = x;
    this._position.y = y;
    this._position.z = z;
  }

  onKeyboard(event) {
    switch (event.code) {
      case "ArrowUp":
        this._position.add(this._target.multiply(this._speed));
        break;
      case "ArrowDown":
        this._position.subtract(this._target.multiply(this._speed));
        break;
      case "ArrowLeft":
        const left = this._target.cross(this._up);
        left.normalize();
        left.multiply(this._speed);
        this._position.add(left);
        break;
      case "ArrowRight":
        const right = this._up.cross(this._target);
        right.normalize();
        right.multiply(this._speed);
        this._position.add(right);
        break;
      case "PageUp":
        this._position.y += this._speed;
        break;
      case "PageDown":
        this._position.y -= this._speed;
        break;
      case "+":
        this._speed += 0.1;
        break;
      case "-":
        this._speed -= 0.1;
        if (this._speed < 0.1) {
          this._speed = 0.1;
        }
        break;
      default:
        console.log("Unsupported key");
    }
  }

  get matrix() {
    const cameraTransformation = new Matrix4f();
    cameraTransformation.initCameraTransform(
      this._position,
      this._target,
      this._up
    );

    return cameraTransformation;
  }
}
