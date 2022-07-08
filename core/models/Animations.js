import { Euler } from '../../math/Euler.js'
import { Quaternion } from '../../math/Quaternion.js'
import { Vector3 } from '../../math/Vector3.js'




const _euler = new Euler()

export class Animations {
    constructor(gltfAnimations, skin) {

        const rootBone = skin.root

        const animations = {}
        for (const animationName in gltfAnimations) {
            const animation = animations[animationName] = {}
            const gltfAnimation = gltfAnimations[animationName]

            for (const boneName in gltfAnimation) {
                const boneData = animation[boneName] = {}
                const gltfBoneData = gltfAnimation[boneName]


                // translation
                if (gltfBoneData.translation) {
                    boneData.translation = {
                        key: gltfBoneData.translation.key,
                        frame: []
                    }

                    for (let i = 0; i < gltfBoneData.translation.key.length; i++) {
                        boneData.translation.frame.push(
                            new Vector3().fromArray(
                                gltfBoneData.translation.frame, i * 3))
                    }
                }
                // rotation
                if (gltfBoneData.rotation) {
                    boneData.quaternion = {
                        key: gltfBoneData.rotation.key,
                        frame: [],
                    }

                    const isEuler = gltfBoneData.rotation.frameType === 'VEC3'

                    const size = isEuler === true ? 3 : 4

                    for (let i = 0; i < gltfBoneData.rotation.key.length; i++) {
                        if (isEuler === true) {
                            _euler.fromArray(gltfBoneData.rotation.frame, i * size)
                            boneData.quaternion.frame.push(
                                new Quaternion().setFromEuler(_euler))
                        } else {
                            boneData.quaternion.frame.push(
                                new Quaternion().fromArray(gltfBoneData.rotation.frame, i * size))
                        }
                    }
                }

                //scale
                if (gltfBoneData.scale) {
                    boneData.scale = {
                        key: gltfBoneData.scale.key,
                        frame: [],
                    }
                    for (let i = 0; i < gltfBoneData.scale.key.length; i++) {
                        boneData.scale.frame.push(
                            new Vector3().fromArray(
                                gltfBoneData.scale.frame, i * 3))
                    }
                }
            }
        }
        let currentAnimation = ''

        const updateBone = (bone) => {
            const animation = animations[currentAnimation]

            const { translation, quaternion, scale } = animation[bone.name]
            let i = 0
            if (translation !== undefined) {
                const key = translation.key
                const frame = translation.frame
                let i = 0
                while (t > key[i]) i++
                if (i === 0) {
                    bone.position.copy(frame[0])
                } else if (i >= key.length - 1) {
                    bone.position.copy(frame[key.length - 1])
                } else {
                    const alpha = (t - key[i - 1]) / (key[i] - key[i - 1])
                    bone.position.lerpVectors(frame[i - 1], frame[i], alpha)
                }
            }
            if (quaternion !== undefined) {
                const key = quaternion.key
                const frame = quaternion.frame
                let i = 0
                while (t > key[i]) i++

                if (i === 0) {
                    bone.quaternion.copy(frame[0])
                } else if (i >= key.length - 1) {
                    bone.quaternion.copy(frame[key.length - 1])
                } else {
                    const alpha = (t - key[i - 1]) / (key[i] - key[i - 1])
                    bone.quaternion.slerpQuaternions(frame[i - 1], frame[i], alpha)
                }
            }

            if (scale !== undefined) {
                const key = scale.key
                const frame = scale.frame
                let i = 0
                while (t < key[i]) i++
                if (i === 0) {
                    bone.scale.copy(frame[0])
                } else if (i >= key.length - 1) {
                    bone.scale.copy(frame[key.length - 1])
                } else {
                    const alpha = (t - key[i - 1]) / (key[i] - key[i - 1])
                    bone.scale.lerpVectors(frame[i - 1], frame[i], alpha)
                }
            }
        }

        let t = 0
        this.setT = (tp) => {
            t = tp
            this.update()
        }

        this.update = (dt) => {
            // t += dt
            if (gltfAnimations[currentAnimation] !== undefined) {
                rootBone.traverse(updateBone)
            }
        }

        this.play = (newAnimation) => {
            currentAnimation = newAnimation
        }
        this.stop = () => { currentAnimation = '' }
        // this.animations.fadeIn(0.2)
        // this.animations.fadeOut(0.2)
    }



}