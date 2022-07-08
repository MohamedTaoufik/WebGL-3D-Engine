import { Node } from '../../core/models/Node.js'
import { PI2 } from '../../math/MathUtils.js'
import { Spherical } from '../../math/Spherical.js'
import { Vector3 } from '../../math/Vector3.js'
import { pointMaterial } from '../materials/pointMaterial.js'


export class PointTest {
    constructor(/**@type {Renderer}*/ renderer) {

        const object = new Node(renderer, { pointCount: 1 }, pointMaterial)
        const position = new Vector3()

        this.worldMatrix = object.worldMatrix
        this.texture = object.mesh.textures.texture1

        const spherical = new Spherical(0.5, Math.random() * PI2, Math.random() * PI2)

        const update = (dt) => {
            spherical.phi += Math.sin(dt * .01) * 0.1
            spherical.phi += Math.cos(dt * .01) * 0.01
            position.setFromSpherical(spherical)
            position.y += 1
            position.toArray(object.worldMatrix.elements, 12)
        }

        renderer.onBeforeRender.add(update)
        this.dispose = () => {
            renderer.onBeforeRender.delete(update)
        }
    }
}