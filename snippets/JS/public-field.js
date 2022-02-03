class A {
    position = 0;

    method(x) {
        this.position = x;
    }
}

const main = () => {
    let a = new A();
    a.method(1);
    console.log(a.position);
}

main();

