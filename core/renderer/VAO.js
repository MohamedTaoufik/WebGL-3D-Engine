import { Texture } from './Texture.js'





const instances = new Map()

export class VAO {
    /**
     * 
     * @param {Program} program 
     * @param {Geometry} geometry 
     */
    constructor(program, geometry) {

        if (instances.has(geometry)) {
            return instances.get(geometry)
        }

        const gl = program.gl
        this.gl = gl
        gl.useProgram(program.program)

        this.vao = gl.createVertexArray()
        gl.bindVertexArray(this.vao)

        this.meshes = new Set()

        const buffers = {}

        const object_attributes = {}
        for (const key in geometry.primitives) {
            const primitive = geometry.primitives[key]
            const name = primitive.name
            buffers[name] = gl.createBuffer()
            const data = primitive.buffer
            const location = gl.getAttribLocation(program.program, name)
            if (location === -1) {
                console.warn(`getAttribLocation: ${name} optimized`)
                continue
            }
            object_attributes[name] = data
            gl.enableVertexAttribArray(location)
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers[name])
            gl.bufferData(gl.ARRAY_BUFFER, data, gl[primitive.usage])
            if (primitive.type !== 'FLOAT') {
                gl.vertexAttribIPointer(location, primitive.size, gl[primitive.type], 0, 0)
            } else {
                gl.vertexAttribPointer(location, primitive.size, gl[primitive.type], 0, 0, 0)
            }
        }

        this.attributes_update = (attribute_name) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers[attribute_name])
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, object_attributes[attribute_name], 0)
        }

        let indexBuffer
        if (geometry.indices !== undefined) {
            indexBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

        }

        const textures = []
        this.textures = {}
        const programTextureDictionary = program.programTextureDictionary
        for (const key in program.material.textures) {
            const texture = program.material.textures[key]
            if (texture.drawLevel === 'vao') {
                const tex = new Texture(gl, key, texture.createData(geometry), texture.texParameters, texture.updateParameters)
                this.textures[key]
                textures.push(tex)
            }
        }

        this.draw = (dt) => {
            for (const texture of textures) texture.draw(programTextureDictionary)
            for (const object of this.meshes) {
                object.draw(dt)
            }
        }

        instances.set(geometry, this)
        program.vaos.add(this)
        this.dispose = () => {
            textures.length = 0
            if (this.meshes.size !== 0) {
                console.warn(`try to dispose VAO but there are still meshes.`)
            } else {
                program.vaos.delete(this)
                instances.delete(geometry)
                // TODO dispose program
            }
        }
    }
}




