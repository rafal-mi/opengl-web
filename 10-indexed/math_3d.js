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