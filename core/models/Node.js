import { defaultMaterial } from '../../examples/materials/defaultMaterial.js'
import { defaultSkinMaterial } from '../../examples/materials/defaultSkinMaterial.js'
import { pointMaterial } from '../../examples/materials/pointMaterial.js'
import { Matrix4 } from '../../math/Matrix4.js'
import { Quaternion } from '../../math/Quaternion.js'
import { Vector3 } from '../../math/Vector3.js'
import { Animations } from './Animations.js'
import { Geometry, SkinnedGeometry } from './Geometry.js'
import { Mesh } from './Mesh.js'
import { Point } from './Point.js'
import { Skin } from './Skin.js'


export class Node {

    constructor(renderer, gltfNode, material, parent) {
        this.name = gltfNode.name

        this.parent = parent
        this.children = new Set()
        this.add = (child) => {
            this.children.add(child)
            child.parent = this
        }
        this.delete = (child) => {
            this.children.delete(child)
            child.parent = undefined
        }

        this.worldMatrix = new Matrix4()
        this.worldMatrixNeedsUpdates = true

        this.updateWorldMatrix = (updateParents = true, updateChildren = true) => {

            this.worldMatrix.compose(this.position, this.quaternion, this.scale)

            if (parent !== undefined) {
                if (updateParents === true) {
                    parent.updateWorldMatrix(true, false)
                }
                this.worldMatrix.premultiply(this.parent.worldMatrix)
            }

            if (updateChildren === true) {
                for (const child of this.children) {
                    child.updateWorldMatrix(false, true)
                }
            }

            this.worldMatrixNeedsUpdates = false
        }

        const update = () => {
            if (this.worldMatrixNeedsUpdates === true) {
                this.updateWorldMatrix(true, true)
            }
        }

        this.position = new Vector3()
        this.quaternion = new Quaternion()
        this.scale = new Vector3(1, 1, 1)

        if (gltfNode.rotation) this.quaternion.fromArray(gltfNode.rotation)
        if (gltfNode.translation) this.position.fromArray(gltfNode.translation)
        if (gltfNode.scale) this.scale.fromArray(gltfNode.scale)

        this.mesh
        if (gltfNode.mesh) {
            // for (const primitive of gltfNode.mesh.primitives) {
                const primitive = gltfNode.mesh.primitives[0]
                if (primitive.attributes.WEIGHTS_0) {
                    this.mesh = new Mesh(renderer, material ?? defaultSkinMaterial, new SkinnedGeometry(primitive), this)
                } else {
                    this.mesh = new Mesh(renderer, material ?? defaultMaterial, new Geometry(primitive), this)
                }
                if (gltfNode.skin) {
                    this.skin = new Skin(renderer, gltfNode.skin, this.mesh)
                    if (gltfNode.skin.animations) {
                        this.animations = new Animations(gltfNode.skin.animations, this.skin)                        
                    }
                }

            // }

        } else if (gltfNode.pointCount) {
            this.mesh = new Point(renderer, material ?? pointMaterial, gltfNode, this)
        }

        if (gltfNode.children !== undefined) {
            for (const child of gltfNode.children) {
                this.children.add(new Node(renderer, child, this))
            }
        }

        renderer.onBeforeRender.add(update)
        this.dispose = () => {
            if (parent !== undefined) {
                parent.children.delete(this)
            }
            for (const child of this.children) {
                child.dispose()
            }
            renderer.onBeforeRender.delete(update)
            this.mesh?.dispose()
        }
    }
}







