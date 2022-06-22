import { Camera } from './Camera.js'
import { DirectionalLights } from './DirectionalLights.js'
import { PointLights } from './PointLights.js'

export const NO_BLENDING = 0
export const NORMAL_BLENDING = 1
export const ADDITIVE_BLENDING = 2
export const MULTIPLY_BLENDING = 3

export class Renderer {

    constructor() {

        this.canvas = document.createElement('canvas')
        const gl = this.canvas.getContext('webgl2', {
            alpha: true,
            depth: true,
            stencil: true,
            antialias: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false,
        })
        this.gl = gl

        /** @type {Set<Program>} */
        this.programs = new Set()

        this.camera = new Camera(gl)
        this.directional_lights = new DirectionalLights(gl)
        this.point_lights = new PointLights(gl)
        const on_resize = () => {
            const width = this.canvas.clientWidth || 1
            const height = this.canvas.clientHeight || 1
            this.canvas.width = width
            this.canvas.height = height
            gl.viewport(0, 0, width, height)
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
        }
        on_resize()
        const resize_observer = new ResizeObserver(on_resize)
        resize_observer.observe(this.canvas)

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.enable(gl.BLEND)
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        let blending_state = NO_BLENDING
        let depth_test_enabled = true
        let depth_write_enabled = true

        const blending_function = {
            [NORMAL_BLENDING]: () => {
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            },
            [ADDITIVE_BLENDING]: () => {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
            },
            [MULTIPLY_BLENDING]: () => {
                gl.blendFunc(gl.ZERO, gl.SRC_COLOR)
            },
        }

        this.on_before_render = new Set()
        this.draw = (dt) => {
            for (const cb of this.on_before_render) {
                cb(dt)
            }

            if (this.camera.needsUpdate === true) {
                this.camera.update_projectionViewMatrix()
            }
                    
            for (const program of this.programs) {

                // blending
                if (program.blending !== blending_state) {
                    if (blending_state === NO_BLENDING) {
                        gl.enable(gl.BLEND)
                        blending_state = program.blending
                        blending_function[blending_state]()
                    } else if (program.blending === NO_BLENDING) {
                        gl.disable(gl.BLEND)
                        blending_state = NO_BLENDING
                    } else {
                        blending_state = program.blending
                        blending_function[blending_state]()
                    }
                }

                // depth_test
                if (program.depth_test !== depth_test_enabled) {
                    depth_test_enabled = !depth_test_enabled
                    if (depth_test_enabled === true) {
                        gl.enable(gl.DEPTH_TEST)
                    } else {
                        gl.disable(gl.DEPTH_TEST)
                    }
                }

                // depth_write
                if (program.depth_write !== depth_write_enabled) {
                    depth_write_enabled = !depth_write_enabled
                    gl.depthMask(depth_write_enabled)
                }

                // draw
                program.draw(dt)
            }

            this.camera.needsUpdate = false
            this.directional_lights.needsUpdate = false
            this.point_lights.needsUpdate = false
        }
    }
}


