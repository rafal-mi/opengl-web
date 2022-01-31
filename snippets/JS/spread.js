const { thomsonCrossSectionDependencies } = require("mathjs");

class A {
  sum(x, y) {
    return x + y;
  }
}

class B {
  constructor() {
    this._array = [1, 2];
  }

  sum() {
    const a = new A();
    const s = a.sum(...this._array);
    console.log(s);
  }
}

const main = () => {
  const b = new B();
  b.sum();
}

main();
