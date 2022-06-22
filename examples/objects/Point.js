
import { Matrix4 } from '../../math/Matrix4.js'
import { Object3D_Abstract } from '../../core/Object3D_Abstract.js'


const COUNT = 1
export class Point extends Object3D_Abstract {
    /**
     * 
     * @param {Program} program 
     */
    constructor(program, attributes = {}) {
        super(program, attributes)

        /** @type {Matrix4} */
        this.worldMatrix = program.material.uniforms.worldMatrix.clone()

        const uniform_setters = program.uniform_setters
        const gl = program.gl

        this.draw = () => {

            uniform_setters.worldMatrix(this.worldMatrix)

            gl.drawArrays(gl.POINTS, 0, COUNT)
        }

        this.dispose = () => {
            this.super_dispose()
        }
    }
}
