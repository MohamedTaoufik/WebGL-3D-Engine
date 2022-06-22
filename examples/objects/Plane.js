
import { Matrix4 } from '../../math/Matrix4.js'
import { Object3D_Abstract } from '../../core/Object3D_Abstract.js'
import { PI } from '../../math/MathUtils.js'
import { Vector3 } from '../../math/Vector3.js'



export class Plane extends Object3D_Abstract {
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
        this.worldMatrix.makeScale(0.01, 0.01, 0.01)

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
const normal = new Float32Array([
    // left column front
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
])
const position = new Float32Array([
    // left column front
    0, 0, 0,
    0, 1, 0,
    1, 0, 0,
    1, 1, 0,
])

const indices_data = [
    0, 1, 2,
    1, 3, 2
]

