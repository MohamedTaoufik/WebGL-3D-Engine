import { Program } from '../renderer/Program.js'
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
        const program = new Program(renderer, material)

        const gl = program.gl
        this.uniformSetters = program.uniformSetters
        this.bindTexture = program.bindTexture
        const count = gltfNode.pointCount
        this.draw = () => {
            this.uniformSetters.u_worldMatrix(node.worldMatrix)
            gl.drawArrays(gl.POINTS, 0, count)
        }

        program.vaos.add(this)
        this.dispose = () => {
            program.vaos.delete(this)
        }
    }
}




