

/* BINARY EXTENSION */
const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
const BINARY_EXTENSION_HEADER_LENGTH = 12
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 }

class GLBinaryData {

    constructor(data) {

        const textDecoder = new TextDecoder()

        this.content = null
        this.body = null

        const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH)

        this.header = {
            magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
            version: headerView.getUint32(4, true),
            length: headerView.getUint32(8, true)
        }

        if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {

            throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.')

        } else if (this.header.version < 2.0) {

            throw new Error('THREE.GLTFLoader: Legacy binary file detected.')

        }

        const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH

        const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH)
        let chunkIndex = 0

        while (chunkIndex < chunkContentsLength) {

            const chunkLength = chunkView.getUint32(chunkIndex, true)
            chunkIndex += 4

            const chunkType = chunkView.getUint32(chunkIndex, true)
            chunkIndex += 4

            if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {

                const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength)
                this.content = JSON.parse(textDecoder.decode(contentArray))

            } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {

                const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex
                this.body = data.slice(byteOffset, byteOffset + chunkLength)

            }

            // Clients must ignore chunks with unknown types.

            chunkIndex += chunkLength

        }

        if (this.content === null) {

            throw new Error('THREE.GLTFLoader: JSON content not found.')

        }
    }
}

const TYPE_CLASS = {
    '5120': Int8Array,    // gl.BYTE
    '5121': Uint8Array,   // gl.UNSIGNED_BYTE
    '5122': Int16Array,   // gl.SHORT
    '5123': Uint16Array,  // gl.UNSIGNED_SHORT
    '5124': Int32Array,   // gl.INT
    '5125': Uint32Array,  // gl.UNSIGNED_INT
    '5126': Float32Array, // gl.FLOAT
}

export class GLBLoader {

    /**
     * @param {URL} url 
     */
    load = async (url) => {

        const bin = new Uint8Array(
            typeof fetch === 'undefined' ?
                (await import('fs')).readFileSync(url)
                : await fetch(url).then((res) => res.arrayBuffer())
        )

        const gltf = new GLBinaryData(bin.buffer)

        const body = gltf.body
        const content = gltf.content
        const nodes = content.nodes

        // accessors
        const accessors = content.accessors
        const bufferViews = content.bufferViews
        for (const accessor of accessors) {
            const bufferView = bufferViews[accessor.bufferView]
            accessor.buffer = new TYPE_CLASS[accessor.componentType](
                body.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
            )
            delete accessor.componentType
            delete accessor.bufferView
        }

        // animation
        if (content.animations) {
            const animations = {}
            for (const animation of content.animations) {
                const channels = animation.channels
                const samplers = animation.samplers

                const bones = {}
                for (const channel of channels) {
                    const sampler = samplers[channel.sampler]
                    const target = channel.target
                    // channel.sampler = sampler

                    const name = nodes[channel.target.node].name
                    if (bones[name] === undefined) bones[name] = {}
                    bones[name][channel.target.path] = {
                        key: accessors[sampler.input].buffer,
                        frame: accessors[sampler.output].buffer,
                        frameType: accessors[sampler.output].type,
                        interpolation: sampler.interpolation,
                    }
                }

                animations[animation.name] = bones
                delete animation.samplers
            }
            content.animations = animations
        }

        // meshes
        for (const mesh of content.meshes) {
            const primitives = mesh.primitives
            for (const primitive of primitives) {
                const attributes = primitive.attributes
                for (const key in attributes) {
                    const accessorID = attributes[key]
                    attributes[key] = accessors[accessorID]
                }
                primitive.indices = accessors[primitive.indices]
            }
        }

        //skins
        const skins = content.skins

        if (skins) {
            for (const skin of skins) {
                skin.animations = {}
                skin.inverseBindMatrices = accessors[skin.inverseBindMatrices]
                skin.joints = skin.joints.map(a => nodes[a])
                for (let i = 0; i < skin.joints.length; i++) {
                    const joint = skin.joints[i]
                    joint.id = i

                    for (const animationName in content.animations) {
                        const animation = content.animations[animationName]
                        for (const boneName in animation) {
                            if (boneName === joint.name) {
                                skin.animations[animationName] = animation
                                break
                            }
                        }
                    }

                }
            }
        }

        // nodes
        for (const node of nodes) {
            if (node.mesh !== undefined) node.mesh = content.meshes[node.mesh]
            if (node.children !== undefined) node.children = node.children.map(a => nodes[a])
            if (node.skin !== undefined) node.skin = skins[node.skin]
        }

        // misc
        delete content.bufferViews
        delete content.buffers
        delete content.asset
        delete content.scenes
        delete content.scene
        // delete content.skins

        return content
    }
}
