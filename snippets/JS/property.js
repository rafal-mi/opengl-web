class A {
  constructor() {
    this._vector = [0, 0, 0];
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
}

const propertyJSMain = () => {
  const a = new A();
  a.x = 1.0;
  console.log(a.vector);
}

propertyJSMain();
