


import { PI05 } from '../math/MathUtils.js'
import { PI2 } from '../math/MathUtils.js'
import { Spherical } from '../math/Spherical.js'
import { Vector2 } from '../math/Vector2.js'
import { Vector3 } from '../math/Vector3.js'


const _v1 = new Vector3()
const _up = new Vector3(0, 1, 0)

export class OrbitControls {

    #offset_y = 0
    get offset_y() { return this.#offset_y }
    set offset_y(a) {
        if (this.#offset_y !== a
            && Number.isFinite(a)
        ) {
            this.#offset_y = a

        }
    }

    #sensitivity = 4
    get sensitivity() { return this.#sensitivity }
    set sensitivity(a) {
        if (this.#sensitivity !== a
            && Number.isFinite(a)
            && a >= 1
        ) {
            this.#sensitivity = a

        }
    }
    toArray = () => [
        this.#offset_y,
        this.#sensitivity
    ]
    fromArray = (array) => {
        if (array?.constructor !== Array) return
        this.offset_y = array[0]
        this.sensitivity = array[1]
    }

    /**
     * 
     * @param {Camera} camera 
     * @param {HTMLCanvasElement} domElement 
     * @param {Vector3} target 
     * @param {Set<function>} on_before_render 
     */
    constructor(
        camera,
        domElement,
        on_before_render
    ) {
        addEventListener('contextmenu', (e) => { e.stopPropagation(); e.preventDefault() })
        
        domElement.style.touchAction = 'none'

        const target = new Vector3(0, 0, 0)
        this.target = target

        const spherical = new Spherical(10, -PI05, 0)
        const direction = new Vector3()

        // const cam_p = camera.position
        const cam_p = camera.worldCameraMatrix.position

        const pan = new Vector2()

        const vertical_metric = new Vector3()
        const horizontal_metric = new Vector3()

        const update = (dt) => {
            // const dt = Math.min(THR.dt * 5, 1)

            if (pan.x !== 0 || pan.y !== 0) {

                direction.subVectors(cam_p, target)
                const dir_length = direction.length()

                // cross vectors simplified
                horizontal_metric.crossVectors(direction, _up).normalize()

                vertical_metric.crossVectors(horizontal_metric, direction).normalize()

                pan.multiplyScalar(0.1)

                horizontal_metric.multiplyScalar(pan.x)
                vertical_metric.multiplyScalar(pan.y)

                target.add(horizontal_metric)
                    .add(vertical_metric)
            }

            direction.setFromSpherical(spherical)

            cam_p.copy(target).add(direction)

            camera.lookAt(target)
            camera.projectionViewMatrixNeedsUpdate = true
        }

        const last_mouse_position = new Vector2()

        const on_pointermove = (e) => {
            if (e.buttons === 1) {
                spherical.phi += (e.clientY - last_mouse_position.y) / 100
                spherical.theta += (last_mouse_position.x - e.clientX) / 100

            } else {
                pan.set(e.clientX, e.clientY)
                    .sub(last_mouse_position)
            }
            last_mouse_position.set(e.clientX, e.clientY)
        }

        const on_wheel = (e) => {
            spherical.radius += e.deltaY / 1000
        }
        addEventListener('wheel', on_wheel)

        const on_pointerdown = (e) => {
            last_mouse_position.set(e.clientX, e.clientY)
            domElement.setPointerCapture(e.pointerId)
            domElement.addEventListener('pointermove', on_pointermove)
        }
        domElement.addEventListener('pointerdown', on_pointerdown)

        const on_lostpointercapture = () => {
            domElement.removeEventListener('pointermove', on_pointermove)
        }
        domElement.addEventListener('lostpointercapture', on_lostpointercapture)

        on_before_render.add(update)

        this.dispose = () => {
            on_before_render.delete(update)
            domElement.removeEventListener('pointerdown', on_pointerdown)
            domElement.removeEventListener('lostpointercapture', on_lostpointercapture)
            removeEventListener('wheel', on_wheel)
        }
    }
}

// ---------------------------------------------------------------------------------






