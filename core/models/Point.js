import { Program } from '../renderer/Program.js'
import { Texture } from '../renderer/Texture.js'
import { VAO } from '../renderer/VAO.js'
import { Geometry } from './Geometry.js'
import { Material } from './Material.js'

export class Point {
    /**
     * @param {Renderer} renderer 
     * @param {Material} material 
     * @param {Geometry} geometry 
     * @param {Node} node 
     */
    constructor(renderer, material, gltfNode = { pointCount: 1 }, node) {
        this.program = new Program(renderer, material)

        const gl = this.program.gl
        this.uniformSetters = this.program.uniformSetters
        this.bindTexture = this.program.bindTexture
        const count = gltfNode.pointCount

        this.textures = {}
        const textures = []
        for (const key in material.textures) {
            const texture = material.textures[key]
            if (texture.drawLevel === 'object') {
                const tex = new Texture(gl, key, texture.createData(), texture.texParameters, texture.updateParameters)
                this.textures[key] = tex
                textures.push(tex)
            }
        }

        const programTextureDictionary = this.program.programTextureDictionary
        this.draw = () => {
            for (const texture of textures) {
                texture.draw(programTextureDictionary)
            }
            this.uniformSetters.u_worldMatrix(node.worldMatrix)
            gl.drawArrays(gl.POINTS, 0, count)
        }

        this.program.vaos.add(this)
        this.dispose = () => {
            this.program.vaos.delete(this)
        }
    }
}




