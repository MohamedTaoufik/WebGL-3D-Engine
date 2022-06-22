
import { Matrix4 } from '../../math/Matrix4.js'
import { Object3D_Abstract } from '../../core/Object3D_Abstract.js'
import { Vector3 } from '../../math/Vector3.js'
import { geometry_scale } from '../../utils/geometry_utils.js'



export class Box extends Object3D_Abstract {
    /**
     * 
     * @param {Program} program 
     */
    constructor(
        program,

        // indices = indices_data
    ) {
        const attributes = {
            a_position: new Float32Array(position),
            a_normal: new Float32Array(normal),

        }

        super(program, attributes, indices)

        /** @type {Matrix4} */
        this.worldMatrix = program.material.uniforms.worldMatrix.clone()

        const uniform_setters = program.uniform_setters
        const gl = program.gl

        this.draw = () => {

            uniform_setters.worldMatrix(this.worldMatrix)

            gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
        }

        this.dispose = () => {
            this.super_dispose()
        }
    }
}

const position = [-1, -1, 1, -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, -1, -1, 1, -1, 1, -1, 1, 1, -1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1,]
geometry_scale(position, 0.5, 0.5, 0.5)
const normal = [-1, 0, -0, 0, -1, -0, 0, 0, 1, -1, 0, -0, 0, 0, 1, 0, 1, -0, -1, 0, -0, 0, -1, -0, 0, 0, -1, -1, 0, -0, 0, 0, -1, 0, 1, -0, 0, -1, -0, 0, 0, 1, 1, 0, -0, 0, 0, 1, 0, 1, -0, 1, 0, -0, 0, -1, -0, 0, 0, -1, 1, 0, -0, 0, 0, -1, 0, 1, -0, 1, 0, -0,]
const indices = [0, 3, 9, 0, 9, 6, 8, 10, 21, 8, 21, 19, 20, 23, 17, 20, 17, 14, 13, 15, 4, 13, 4, 2, 7, 18, 12, 7, 12, 1, 22, 11, 5, 22, 5, 16]
const count = indices.length