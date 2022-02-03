const MARGIN = 20;
const EDGE_STEP = 0.01;

class Camera {
  #mousePosition = new Vector2i();

  constructor(windowWidth, windowHeight, position, target, up) {
    this._windoWidth = windowWidth;
    this._windowHeight = windowHeight;
    this._position = position !== undefined ? position : new Vector3f(0.0, 0.0, 0.0);
    this._target = target !== undefined ? target : new Vector3f(0.0, 0.0, 1.0);
    this._up = up !== undefined ? up : new Vector3f(0.0, 1.0, 0.0);

    up.normalize();

    this.init();
  }

  init() {
    const hTarget = new Vector3f(this._target.x, 0.0, this._target.z);
    hTarget.normalize();

    let angle = toDegree(Math.asin(Math.abs(hTarget.z)));

    if (hTarget.z >= 0.0) {
      if (hTarget.x >= 0.0) {
        this._angleH = 360.0 - angle;
      } else {
        this._angleH = 180.0 + angle;
      }
    } else {
      if (hTarget.x >= 0.0) {
        this._angleH = angle;
      } else {
        this._angleH = 180.0 - angle;
      }
    }

    this._angleV = -toDegree(Math.asin(this._target.y));

    this._onUpperEdge = false;
    this._onLowerEdge = false;
    this._onLeftEdge = false;
    this._onRightEdge = false;
    this.#mousePosition.x = this._windowWidth / 2;
    this.#mousePosition.y = this._windowHeight / 2;
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

  onMouse(x, y) {
    const deltaX = x - this.#mousePosition.x;
    const deltaY = x - this.#mousePosition.y;

    this.#mousePosition.x = x;
    this.#mousePosition.y = y;

    this._angleH = deltaX / 20.0;
    this._angleV = deltaY / 50.0;

    if(deltaX === 0) {
      if(x < MARGIN) {
        this._onLeftEdge = true;
      } else if(x >= this._windoWidth - MARGIN) {
        this._onRightEdge = true;
      }
    } else {
      this._onLeftEdge = false;
      this._onRightEdge = false;
    }

    if(deltaY === 0) {
      if(y < MARGIN) {
        this._onUpperEdge = true;
      } else if(x >= this._windowHeight - MARGIN) {
        this._onLowerEdge = true;
      }
    } else {
      this._onUpperEdge = false;
      this._onLowerEdge = false;
    }

    update();
  }

  update() {
    const yAxis = new Vector3f(0.0, 1.0, 0.0);

    
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
