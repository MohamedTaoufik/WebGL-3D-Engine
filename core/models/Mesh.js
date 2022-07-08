import { Program } from '../renderer/Program.js'
import { Texture } from '../renderer/Texture.js'
import { VAO } from '../renderer/VAO.js'
import { Geometry } from './Geometry.js'
import { Material } from './Material.js'



export class Mesh {
    /**
     * 
     * @param {Renderer} renderer 
     * @param {Geometry} geometry 
     * @param {Material} material 
     * @param {Node} node 
     */
    constructor(renderer, material, geometry, node) {

        this.program = new Program(renderer, material)
        this.vao = new VAO(this.program, geometry)

        const gl = this.program.gl
        this.uniformSetters = this.program.uniformSetters
        this.bindTexture = this.program.bindTexture
        const count = geometry.indices.length

        this.onBeforeDraw = () => { }

        this.textures = {}
        const textures = []
        for (const key in material.textures) {
            const texture = material.textures[key]
            if (texture.drawLevel === 'object') {
                const tex = new Texture(gl, key, texture.createData(geometry), texture.texParameters, texture.updateParameters)
                this.textures[key] = tex
                textures.push(tex)
            }
        }

        const programTextureDictionary = this.program.programTextureDictionary
        this.draw = () => {
            for (const texture of textures) {
                texture.draw(programTextureDictionary)
            }
            this.onBeforeDraw()
            this.uniformSetters.u_worldMatrix(node.worldMatrix)
            gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
        }

        this.vao.meshes.add(this)
        this.dispose = () => {
            this.vao.meshes.delete(this)
        }
    }
}




