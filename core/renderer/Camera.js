
import { DEG2RAD } from '../../math/MathUtils.js'
import { Matrix4 } from '../../math/Matrix4.js'
import { Vector3, _up } from '../../math/Vector3.js'

const vs_pars = `
uniform UBO_camera {
    mat4 u_projectionViewMatrix;
    mat4 u_viewMatrix;
    vec3 u_cameraPosition;
    // mat4 u_worldCameraMatrix;
};
`

const _vec3 = new Vector3()
export class Camera {

    static vs_pars = vs_pars

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {*} near 
     * @param {*} far 
     * @param {*} fov 
     */
    constructor(gl, near = 0.1, far = 1000, fov = 50) {
        this.near = near
        this.far = far
        this.fov = fov
        this.aspect = 1

        this.filmGauge = 35
        this.filmOffset = 0

        this.projectionMatrix = new Matrix4()
        this.worldCameraMatrix = new Matrix4()
        this.viewMatrix = new Matrix4()
        this.projectionViewMatrix = new Matrix4()

        this.position = new Vector3()

        this.lookAt = (x, y, z) => {
            if (x.constructor === Vector3) {
                this.worldCameraMatrix.lookAt(this.position, x, _up)
            } else {
                _vec3.set(x, y, z)
                this.worldCameraMatrix.lookAt(this.position, _vec3, _up)
            }
        }

        this.needsUpdate = true

        this.UBO_index = 0
        const UBO_buffer = gl.createBuffer()
        const UBO_data = new Float32Array(16 * 3)
        gl.bindBuffer(gl.UNIFORM_BUFFER, UBO_buffer)
        gl.bufferData(gl.UNIFORM_BUFFER, UBO_data, gl.DYNAMIC_DRAW)
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.UBO_index, UBO_buffer)

        this.update_projectionViewMatrix = () => {
            this.worldCameraMatrix.elements[12] = this.position.x
            this.worldCameraMatrix.elements[13] = this.position.y
            this.worldCameraMatrix.elements[14] = this.position.z

            this.viewMatrix
                .copy(this.worldCameraMatrix)
                .invert()
            this.projectionViewMatrix
                .copy(this.viewMatrix)
                .premultiply(this.projectionMatrix)

            this.projectionViewMatrix.toArray(UBO_data)
            this.viewMatrix.toArray(UBO_data, 16)
            this.position.toArray(UBO_data, 32)

            gl.bindBuffer(gl.UNIFORM_BUFFER, UBO_buffer)
            gl.bufferData(gl.UNIFORM_BUFFER, UBO_data, gl.DYNAMIC_DRAW)
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this.UBO_index, UBO_buffer)
        }
    }

    updateProjectionMatrix() {

        const near = this.near
        let top = near * Math.tan(DEG2RAD * 0.5 * this.fov)
        let height = 2 * top
        let width = this.aspect * height
        let left = - 0.5 * width

        // const skew = this.filmOffset
        // if (skew !== 0) left += near * skew / this.getFilmWidth()
        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far)

        this.needsUpdate = true
    }
}





