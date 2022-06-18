import { Camera } from './Camera.js'




export class Renderer {
    constructor() {

        this.canvas = document.createElement('canvas')
        this.gl = this.canvas.getContext('webgl2')

        this.programs = new Set()

        this.camera = new Camera()

        const on_resize = () => {
            const width = this.canvas.clientWidth || 1
            const height = this.canvas.clientHeight || 1
            this.canvas.width = width
            this.canvas.height = height
            this.gl.viewport(0, 0, width, height)
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
        }
        on_resize()
        const resize_observer = new ResizeObserver(on_resize)
        resize_observer.observe(this.canvas)

        // Clear the canvas
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)

        this.on_before_render = new Set()
        this.draw = (dt) => {
            for (const cb of this.on_before_render) {
                cb(dt)
            }

            if (this.camera.projectionViewMatrixNeedsUpdate === true) {

                this.camera.projectionViewMatrix
                    .copy(this.camera.worldCameraMatrix)
                    .invert()
                    .premultiply(this.camera.projectionMatrix)

            }

            for (const material of this.programs) {
                material.draw(dt)
            }

            this.camera.projectionViewMatrixNeedsUpdate = false
        }
    }
}


