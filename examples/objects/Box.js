
import { Matrix4 } from '../../math/Matrix4.js'
import { Object3D_Abstract } from '../../core/Object3D_Abstract.js'
import { geometry_scale } from '../../utils/geometry_utils.js'


const position = [-1, -1, 1, -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, -1, -1, 1, -1, 1, -1, 1, 1, -1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1,]
geometry_scale(position, 0.5, 0.5, 0.5)
const normal = [-1, 0, -0, 0, -1, -0, 0, 0, 1, -1, 0, -0, 0, 0, 1, 0, 1, -0, -1, 0, -0, 0, -1, -0, 0, 0, -1, -1, 0, -0, 0, 0, -1, 0, 1, -0, 0, -1, -0, 0, 0, 1, 1, 0, -0, 0, 0, 1, 0, 1, -0, 1, 0, -0, 0, -1, -0, 0, 0, -1, 1, 0, -0, 0, 0, -1, 0, 1, -0, 1, 0, -0,]
const indices = [0, 3, 9, 0, 9, 6, 8, 10, 21, 8, 21, 19, 20, 23, 17, 20, 17, 14, 13, 15, 4, 13, 4, 2, 7, 18, 12, 7, 12, 1, 22, 11, 5, 22, 5, 16]
const count = indices.length

export class Box extends Object3D_Abstract {

    static attributes = {
        a_position: new Float32Array(position),
        a_normal: new Float32Array(normal),
    }
    static indices = indices

    /**
     * 
     * @param {VAO} vao 
     */
    constructor(vao) {
        super(vao)
        const gl = vao.gl
        const uniform_setters = vao.uniform_setters
        /** @type {Matrix4} */
        this.worldMatrix = new Matrix4()

        this.draw = () => {
            uniform_setters.worldMatrix(this.worldMatrix)
            gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
        }

        this.dispose = () => {
            this.super_dispose()
        }
    }
}
