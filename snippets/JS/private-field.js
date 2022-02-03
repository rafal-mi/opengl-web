class A {
    #position = 0;

    get position() {
        return this.#position;
    }

    method(x) {
        this.#position = x;
    }
}

const main = () => {
    let a = new A();
    a.method(1);

    // Not working without the getter
    console.log(a.position);
}

main();

