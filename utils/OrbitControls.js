


import { PI, PI05 } from '../math/MathUtils.js'
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
     * @param {Set<function>} onBeforeRender 
     */
    constructor(
        camera,
        domElement,
        onBeforeRender
    ) {
        addEventListener('contextmenu', (e) => { e.stopPropagation(); e.preventDefault() })

        domElement.style.touchAction = 'none'

        const target = new Vector3(0, 0, 0)
        this.target = target

        const spherical = new Spherical(10, -1, 4)
        const direction = new Vector3()

        // const cam_p = camera.position
        const cam_p = camera.position

        const pan = new Vector2()

        const verticalScreen = new Vector3()
        const horizontalScreen = new Vector3()

        const update = () => {
            if (camera.needsUpdate !== true) return

            if (pan.x !== 0 || pan.y !== 0) {

                direction.subVectors(cam_p, target)

                // cross vectors simplified
                horizontalScreen.crossVectors(direction, _up).normalize()
                verticalScreen.crossVectors(horizontalScreen, direction).normalize()

                pan.multiplyScalar(0.01)

                horizontalScreen.multiplyScalar(pan.x)
                verticalScreen.multiplyScalar(pan.y)

                target.add(horizontalScreen)
                    .add(verticalScreen)
            }

            if (spherical.radius < 0.1) spherical.radius = 0.1
            if (spherical.phi > -0.1) spherical.phi = -0.1
            else if (spherical.phi < -3) spherical.phi = -3
            direction.setFromSpherical(spherical)

            cam_p.copy(target).add(direction)

            camera.lookAt(target)

        }

        const lastMousePosition = new Vector2()

        const on_pointermove = (e) => {
            if (e.buttons === 1) {
                spherical.phi += (e.clientY - lastMousePosition.y) / 100
                spherical.theta += (lastMousePosition.x - e.clientX) / 100
            } else {
                pan.x += e.clientX - lastMousePosition.x
                pan.y += e.clientY - lastMousePosition.y
            }
            lastMousePosition.set(e.clientX, e.clientY)
            camera.needsUpdate = true
        }

        const on_wheel = (e) => {
            spherical.radius += e.deltaY / 100
            camera.needsUpdate = true
        }
        addEventListener('wheel', on_wheel)

        const on_pointerdown = (e) => {
            lastMousePosition.set(e.clientX, e.clientY)
            domElement.setPointerCapture(e.pointerId)
            domElement.addEventListener('pointermove', on_pointermove)
        }
        domElement.addEventListener('pointerdown', on_pointerdown)

        const on_lostpointercapture = () => {
            domElement.removeEventListener('pointermove', on_pointermove)
            camera.needsUpdate = true
        }
        domElement.addEventListener('lostpointercapture', on_lostpointercapture)

        onBeforeRender.add(update)

        this.dispose = () => {
            onBeforeRender.delete(update)
            domElement.removeEventListener('pointerdown', on_pointerdown)
            domElement.removeEventListener('lostpointercapture', on_lostpointercapture)
            removeEventListener('wheel', on_wheel)
        }
    }
}

// ---------------------------------------------------------------------------------






