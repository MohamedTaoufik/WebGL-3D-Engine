import { Matrix4 } from '../../math/Matrix4.js'
import { Quaternion } from '../../math/Quaternion.js'
import { Vector3 } from '../../math/Vector3.js'
import { Texture } from '../renderer/Texture.js'





const vs_pars = `
in vec4 a_weights;
in uvec4 a_joints;

uniform sampler2D u_jointTexture;

mat4 getBoneMatrix(uint jointNdx) {
  return mat4(
    texelFetch(u_jointTexture, ivec2(0, jointNdx), 0),
    texelFetch(u_jointTexture, ivec2(1, jointNdx), 0),
    texelFetch(u_jointTexture, ivec2(2, jointNdx), 0),
    texelFetch(u_jointTexture, ivec2(3, jointNdx), 0));
}
`

const vs_main = `
mat4 skinMatrix = getBoneMatrix(a_JOINTS_0[0]) * a_WEIGHTS_0[0] +
    getBoneMatrix(a_JOINTS_0[1]) * a_WEIGHTS_0[1] +
    getBoneMatrix(a_JOINTS_0[2]) * a_WEIGHTS_0[2] +
    getBoneMatrix(a_JOINTS_0[3]) * a_WEIGHTS_0[3];
mat4 world = u_world * skinMatrix;
`

class Bone {
    constructor(joint, jointMatrices, inverseBindMatrices, parent) {

        this.name = joint.name
        this.parent = parent
        const children = []

        this.traverse = (callback) => {
            callback(this)
            for (const child of children) {
                child.traverse(callback)
            }
        }

        this.worldMatrix = new Matrix4()

        this.inverseBindMatrix = new Matrix4()
        this.inverseBindMatrix.fromArray(inverseBindMatrices.slice(joint.id * 16, joint.id * 16 + 16))

        this.boneMatrix = new Matrix4()
        this.boneMatrix.elements = jointMatrices.subarray(joint.id * 16, joint.id * 16 + 16)

        this.quaternion = new Quaternion()
        this.position = new Vector3()
        this.scale = new Vector3(1, 1, 1)
        if (joint.rotation) this.quaternion.fromArray(joint.rotation)
        if (joint.translation) this.position.fromArray(joint.translation)
        if (joint.scale) this.scale.fromArray(joint.scale)


        if (joint.children) {
            for (const child of joint.children) {
                children.push(new Bone(child, jointMatrices, inverseBindMatrices, this))
            }
        }

        this.update = (parentUpdate = true, childUpdate = true) => {
            if (parent && parentUpdate) parent.update(true, false)

            this.worldMatrix.compose(this.position, this.quaternion, this.scale)
            if (parent) this.worldMatrix.premultiply(parent.worldMatrix)
            this.boneMatrix.copy(this.worldMatrix).multiply(this.inverseBindMatrix)

            if (childUpdate === true) {

                for (const child of children) {
                    child.update(false, true)
                }

            }
        }
    }

}

export class Skin {
    /**
     * 
     * @param {Renderer} renderer 
     * @param {*} gltfSkin
     * @param {Mesh} mesh
     */
    constructor(renderer, gltfSkin, mesh) {

        const inverseBindMatrices = gltfSkin.inverseBindMatrices.buffer

        const gl = renderer.gl

        const tex = mesh.textures['u_jointTexture']
        // const tex = new Texture(renderer, 'u_jointTexture', jointMatrices)
        const jointMatrices = tex.data
        // new Float32Array(gltfSkin.joints.length * 16)

        this.root = new Bone(gltfSkin.joints[0], jointMatrices, inverseBindMatrices)

        this.update = () => {
            this.root.update()
            tex.needsDataUpdate = true
        }

        mesh.onBeforeDraw = this.update
        this.update()
    }
}











