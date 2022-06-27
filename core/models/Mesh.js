import { Program } from '../renderer/Program.js'
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
        const program = new Program(renderer, material)
        const vao = new VAO(program, geometry)
        const gl = program.gl
        this.uniformSetters = program.uniformSetters
        this.bindTexture = program.bindTexture
        const count = geometry.indices.length
        this.draw = () => {
            this.uniformSetters.u_worldMatrix(node.worldMatrix)
            gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
        }

        vao.meshes.add(this)
        this.dispose = () => {
            vao.meshes.delete(this)
        }
    }
}




