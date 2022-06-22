
import { Matrix4 } from '../../math/Matrix4.js'
import { Object3D_Abstract } from '../../core/Object3D_Abstract.js'
import { Vector3 } from '../../math/Vector3.js'



export class Box extends Object3D_Abstract {
    /**
     * 
     * @param {Program} program 
     */
    constructor(
        program,
        attributes = {
            a_position: new Float32Array(position),
            a_normal: new Float32Array(normal),
        },
        indices = indices_data
    ) {
        super(program, attributes, indices)

        /** @type {Matrix4} */
        this.worldMatrix = program.material.uniforms.worldMatrix.clone()

        const uniform_setters = program.uniform_setters
        const gl = program.gl

        this.draw = () => {

            uniform_setters.worldMatrix(this.worldMatrix)

            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
        }

        this.dispose = () => {
            this.super_dispose()
        }
    }
}

const position = new Float32Array([
    // left column front
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,

    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
])

const _vec3 = new Vector3()

const normal = new Float32Array(position)

for (let i = 0; i < 8; i++) {
    _vec3.fromArray(position, i * 3)
    _vec3.normalize()
    _vec3.toArray(normal, i * 3)
}

const indices_data = [
    // rear
    4, 5, 7,
    4, 7, 6,

    // top
    4, 2, 0,
    4, 6, 2,

    // right
    2, 6, 3,
    6, 7, 3,

    // left
    4, 0, 1,
    4, 1, 5,

    // bottom
    3, 7, 1,
    1, 7, 5,

    // front
    0, 2, 3,
    0, 3, 1,
]

