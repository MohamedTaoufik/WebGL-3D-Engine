import { Matrix4 } from '../math/Matrix4.js'
import { Vector2 } from '../math/Vector2.js'
import { Vector3 } from '../math/Vector3.js'
import { Vector4 } from '../math/Vector4.js'
import { Object3D_Abstract } from './Object3D_Abstract.js'

export class Program {

    /**
     * @param {Renderer} renderer
     * @param {Material} material
     */
    constructor(renderer, material) {

        this.material = material
        /** @type {Object.<string, function(Number | Vector2 | Vector3 | Vector4 | Matrix4) >} */
        this.uniform_setters = {}

        renderer.programs.add(this)

        const gl = renderer.gl
        const camera = renderer.camera

        const program = createProgram(gl, material.vertexShader, material.fragmentShader)

        this.getAttributes = (object_attributes) => {

            gl.useProgram(program)

            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)

            const buffers = {}

            for (const key in material.attributes) {

                const a = material.attributes[key]

                const location = gl.getAttribLocation(program, key)

                buffers[key] = gl.createBuffer()

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers[key])
                gl.bufferData(gl.ARRAY_BUFFER, object_attributes[key], gl[a.usage])

                gl.enableVertexAttribArray(location)

                gl.vertexAttribPointer(location, a.size, gl[a.type], 0, 0, 0)

            }

            const attributes_update = (attribute_name) => {

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers[attribute_name])
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, object_attributes[attribute_name], 0)

            }

            return {
                /** @type {(attribute_name: String)=>{}} update the given name attribute */
                attributes_update: attributes_update,
                vao: vao,
            }

        }

        /** @type {Set.<Object3D_Abstract>} */
        this.objects = new Set()

        this.draw = () => {
            gl.useProgram(program)

            if (camera.projectionViewMatrixNeedsUpdate === true) {
                this.uniform_setters['projectionViewMatrix'](camera.projectionViewMatrix)
                this.uniform_setters['worldCameraMatrix'](camera.worldCameraMatrix)
            }
            for (const object of this.objects) {
                gl.bindVertexArray(object.vao)
                object.draw()
                gl.drawArrays(gl.TRIANGLES, 0, object.drawArrayCount)
            }
        }

        // init uniforms
        gl.useProgram(program)

        for (const uniform in material.uniforms) {
            const location = gl.getUniformLocation(program, uniform)
            const uniform_data = material.uniforms[uniform]

            this.uniform_setters[uniform] = gl_uniform_type[uniform_data.constructor](gl, location)
            this.uniform_setters[uniform](uniform_data)
        }
        {
            const location = gl.getUniformLocation(program, 'projectionViewMatrix')
            this.uniform_setters['projectionViewMatrix'] = gl_uniform_type[Matrix4](gl, location)
            this.uniform_setters['projectionViewMatrix'](camera.projectionViewMatrix)
        }
        {
            const location = gl.getUniformLocation(program, 'worldCameraMatrix')
            this.uniform_setters['worldCameraMatrix'] = gl_uniform_type[Matrix4](gl, location)
            this.uniform_setters['worldCameraMatrix'](camera.worldCameraMatrix)
        }
    }
}

const vector_2_typed_array = new Float32Array(2)
const vector_3_typed_array = new Float32Array(3)
const vector_4_typed_array = new Float32Array(4)
const matrix_4_typed_array = new Float32Array(16)

const gl_uniform_type = {
    [Number]: (gl, location) => (value) => {
        gl.uniform1f(location, value)
    },
    [Vector2]: (gl, location) => (vector2) => {
        vector2.toArray(vector_2_typed_array)
        gl.uniform2fv(location, vector_2_typed_array)
    },
    [Vector3]: (gl, location) => (vector3) => {
        vector3.toArray(vector_3_typed_array)
        gl.uniform3fv(location, vector_3_typed_array)
    },
    [Vector4]: (gl, location) => (vector4) => {
        vector4.toArray(vector_4_typed_array)
        gl.uniform4fv(location, vector_4_typed_array)
    },
    [Matrix4]: (gl, location) => (matrix4) => {
        matrix4.toArray(matrix_4_typed_array)
        gl.uniformMatrix4fv(location, false, matrix_4_typed_array)
    },
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {String} vertexShader 
 * @param {String} fragmentShader 
 * @returns {WebGLProgram}
 */
const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram()
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShader))
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShader))
    gl.linkProgram(program)
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program
    } else {
        console.warn(gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
    }
}

const createShader = (gl, type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader
    } else {
        console.warn(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
    }
}