
import { DEG2RAD } from '../math/MathUtils.js'
import { Matrix4 } from '../math/Matrix4.js'
import { Vector3, _up } from '../math/Vector3.js'

const vs_pars = `
uniform UBO_camera {
    mat4 u_projectionViewMatrix;
    mat4 u_worldCameraMatrix;
    mat4 u_viewMatrix;
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

        this.position = this.worldCameraMatrix.position

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

            this.viewMatrix
                .copy(this.worldCameraMatrix)
                .invert()
            this.projectionViewMatrix
                .copy(this.viewMatrix)
                .premultiply(this.projectionMatrix)

            this.projectionViewMatrix.toArray(UBO_data)
            this.worldCameraMatrix.toArray(UBO_data, 16)
            this.viewMatrix.toArray(UBO_data, 32)

            gl.bindBuffer(gl.UNIFORM_BUFFER, UBO_buffer)
            gl.bufferData(gl.UNIFORM_BUFFER, UBO_data, gl.DYNAMIC_DRAW)
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this.UBO_index, UBO_buffer)

        }

        // if (this.camera.needsUpdate === true) {
        //     this.uniform_setters['projectionViewMatrix'](this.camera.projectionViewMatrix)
        //     this.uniform_setters['worldCameraMatrix'](this.camera.worldCameraMatrix)
        //     this.uniform_setters['viewMatrix'](this.camera.worldCameraMatrix)
        // }
        // {
        //     const location = gl.getUniformLocation(program, 'projectionViewMatrix')
        //     this.uniform_setters['projectionViewMatrix'] = gl_uniform_type[Matrix4](gl, location)
        //     this.uniform_setters['projectionViewMatrix'](camera.projectionViewMatrix)
        // } {
        //     const location = gl.getUniformLocation(program, 'worldCameraMatrix')
        //     this.uniform_setters['worldCameraMatrix'] = gl_uniform_type[Matrix4](gl, location)
        //     this.uniform_setters['worldCameraMatrix'](camera.worldCameraMatrix)
        // } {
        //     const location = gl.getUniformLocation(program, 'viewMatrix')
        //     this.uniform_setters['viewMatrix'] = gl_uniform_type[Matrix4](gl, location)
        //     this.uniform_setters['viewMatrix'](camera.worldCameraMatrix)
        // }







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





