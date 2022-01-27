const toRadian = x => x * Math.PI / 180.0;

const transpose1d = A => {
    var m = Math.round(Math.sqrt(A.length));
    for(let i = 1; i < m; i++) {
        for(let j = 0; j < i; j++) {
            let x = A[i * m + j];
            A[i * m + j] = A[j * m + i];
            A[j * m + i] = x;
        }
    }
}

const matrixProduct = (A, B, m, n, o) => {
    const C = [];
    for(let i = 0; i < m; i++) {
        for(let j = 0; j < o; j++) {
            let s = 0;
            for(let k = 0; k < n; k++) {
                s += A[i * n + k] * B[k * o + j];
            }
            C[i * n + j] = s;
        }
    }
    return C;
}

const printMatrix4d = A => {
    for(let i = 0; i < 4; i++) {
        let row = "";
        for(let j = 0; j < 4; j++) {
            row += `${A[i * 4 + j]}, `;
        }
        console.log(row);
    }
}
