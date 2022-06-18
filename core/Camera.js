
import { DEG2RAD } from '../math/MathUtils.js'
import { Matrix4 } from '../math/Matrix4.js'
import { Vector3, _up } from '../math/Vector3.js'


const _vec3 = new Vector3()
export class Camera {
    constructor(near = 0.1, far = 1000, fov = 50) {
        this.near = near
        this.far = far
        this.fov = fov
        this.aspect = 1

        this.filmGauge = 35
        this.filmOffset = 0

        this.projectionMatrix = new Matrix4()

        this.worldCameraMatrix = new Matrix4()
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

        this.projectionViewMatrixNeedsUpdate = true
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

        this.projectionViewMatrixNeedsUpdate = true
    }
}





