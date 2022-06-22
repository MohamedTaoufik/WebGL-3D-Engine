



export const mat2_glsl = {
    det: `
    float det(mat2 matrix) {
        return matrix[0].x * matrix[1].y - matrix[0].y * matrix[1].x;
    }
    `,
    transpose: `
    mat2 transpose(mat2 m) {
        return mat2(m[0][0], m[1][0],
                    m[0][1], m[1][1]);
    }
    `
}







