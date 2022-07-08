import { Matrix4 } from '../../math/Matrix4.js'
import { Vector2 } from '../../math/Vector2.js'
import { Vector3 } from '../../math/Vector3.js'
import { Vector4 } from '../../math/Vector4.js'
import { Texture } from './Texture.js'


const instances = new Map()
export class Program {

    /**
     * @param {Renderer} renderer
     * @param {Material} material
     */
    constructor(renderer, material) {

        if (instances.has(material)) {
            return instances.get(material)
        }

        this.material = material
        this.blending = material.blending
        this.depth_test = material.depthTest
        this.depth_write = material.depthWrite

        /** @type {Object.<string, function(Number | Vector2 | Vector3 | Vector4 | Matrix4) >} */
        this.uniform_setters = {}

        const gl = renderer.gl
        this.gl = gl
        const camera = renderer.camera
        const lights = renderer.lights

        this.program = createProgram(gl, material.vertexShader, material.fragmentShader)

        gl.useProgram(this.program)

        this.vaos = new Set()

        const textures = []

        this.draw = (dt) => {

            gl.useProgram(this.program)

            for (const texture of textures) texture.draw(this.programTextureDictionary)

            for (const vao of this.vaos) {
                gl.bindVertexArray(vao.vao)
                vao.draw(dt)
            }
        }

        this.uniformSetters = {}
        this.programTextureDictionary = {}

        for (const uniform in material.uniforms) {
            const type = material.uniforms[uniform]
            const location = gl.getUniformLocation(this.program, uniform)

            this.uniformSetters[uniform] = glUniformType[type](gl, location)
        }

        let textureCount = 0
        for (const key in material.textures) {
            const location = gl.getUniformLocation(this.program, key)
            this.programTextureDictionary[key] = gl[`TEXTURE${textureCount}`]
            gl.uniform1i(location, textureCount)
            textureCount++

            const texture = material.textures[key]
            if (texture.drawLevel === 'program') {
                const tex = new Texture(gl, key, texture.createData(geometry), texture.texParameters, texture.updateParameters)
                this.textures[key]
                textures.push(tex)
            }
        }

        gl.uniformBlockBinding(this.program, gl.getUniformBlockIndex(this.program, "UBO_camera"), camera.UBO_index)
        gl.uniformBlockBinding(this.program, gl.getUniformBlockIndex(this.program, "UBO_lights"), lights.UBO_index)


        instances.set(material, this)
        renderer.programs.add(this)
        this.dispose = () => {
            textures.length = 0
            if (this.vaos.size !== 0) {
                console.warn(`try to dispose program but there are still VAOs.`)
            } else {
                renderer.programs.delete(this)
                instances.delete(material)
                // TODO dispose program
            }
        }
    }
}

const vector_2_typed_array = new Float32Array(2)
const vector_3_typed_array = new Float32Array(3)
const vector_4_typed_array = new Float32Array(4)
const matrix_4_typed_array = new Float32Array(16)

const glUniformType = {
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