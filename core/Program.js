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
        this.blending = material.blending
        this.depth_test = material.depth_test
        this.depth_write = material.depth_write

        /** @type {Object.<string, function(Number | Vector2 | Vector3 | Vector4 | Matrix4) >} */
        this.uniform_setters = {}

        renderer.programs.add(this)

        const gl = renderer.gl
        this.gl = gl
        const camera = renderer.camera
        const directional_lights = renderer.directional_lights
        const point_lights = renderer.point_lights

        const program = createProgram(gl, material.vertexShader, material.fragmentShader)

        this.getAttributes = (object_attributes, indices) => {

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

            if (indices !== undefined) {
                const indexBuffer = gl.createBuffer()
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
            }

            return {
                /** @type {(attribute_name: String)=>{}} update the given name attribute, should be call durring draw*/
                attributes_update: attributes_update,
                vao: vao,
            }

        }



        /** @type {Set.<Object3D_Abstract>} */
        this.objects = new Set()

        this.draw = () => {

            gl.useProgram(program)

            // if (camera.needsUpdate === true) {
            //     this.uniform_setters['projectionViewMatrix'](camera.projectionViewMatrix)
            //     this.uniform_setters['worldCameraMatrix'](camera.worldCameraMatrix)
            //     this.uniform_setters['viewMatrix'](camera.worldCameraMatrix)
            // }

            if (directional_lights.needsUpdate === true) {
                directional_lights.update_uniform(program)
            }

            if (point_lights.needsUpdate === true) {
                point_lights.update_uniform(program)
            }

            for (const object of this.objects) {
                gl.bindVertexArray(object.vao)
                object.draw()
            }
        }

        // init uniforms
        gl.useProgram(program)

        for (const uniform in material.uniforms) {

            const location = gl.getUniformLocation(program, uniform)
            const uniform_data = material.uniforms[uniform]
            const type = uniform_data.constructor

            if (type === HTMLImageElement) {

                // Create a texture.
                const texture = gl.createTexture()

                // make unit 0 the active texture uint
                // (ie, the unit all other texture commands will affect
                gl.activeTexture(gl.TEXTURE0 + 0)

                // Bind it to texture unit 0' 2D bind point
                gl.bindTexture(gl.TEXTURE_2D, texture)

                // Set the parameters so we don't need mips and so we're not filtering
                // and we don't repeat at the edges
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, uniform_data)

            } else {
                this.uniform_setters[uniform] = gl_uniform_type[type](gl, location)
                this.uniform_setters[uniform](uniform_data)
            }
        }

        gl.uniformBlockBinding(program, gl.getUniformBlockIndex(program, "UBO_camera"), camera.UBO_index)
        

        // Camera uniforms
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

        // Lights uniforms
        {
            // const location = gl.getUniformLocation(program, 'worldCameraMatrix')
            // this.uniform_setters['worldCameraMatrix'] = gl_uniform_type[Matrix4](gl, location)
            // this.uniform_setters['worldCameraMatrix'](camera.worldCameraMatrix)
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
        console.warn(('\n' + vertexShader).split('\n').map((a, i) => `${i} ${a}`).join('\n'))
        console.warn(('\n' + fragmentShader).split('\n').map((a, i) => `${i} ${a}`).join('\n'))
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
        console.warn(('\n' + source).split('\n').map((a, i) => `${i} ${a}`).join('\n'))
        console.warn(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
    }
}