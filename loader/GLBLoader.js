

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

const getTypedArrayFromBinary = (accessors, bufferViews, binary, indice) => {
    const accessor = accessors[indice]
    const bufferView = bufferViews[indice]
    return new TYPE_CLASS[accessor.componentType](
        binary.slice(
            bufferView.byteOffset,
            bufferView.byteOffset + bufferView.byteLength,
        ).buffer
    )
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
        console.log(gltf)

        const body = gltf.body
        const content = gltf.content

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
            for (const animation of content.animations) {
                const channels = animation.channels
                const samplers = animation.samplers
                for (const channel of channels) {
                    channel.sampler = samplers[channel.sampler]
                }
                delete animation.samplers
            }
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
        const nodes = content.nodes
        const skins = content.skins
        if (skins) {
            for (const skin of skins) {
                skin.inverseBindMatrices = accessors[skin.inverseBindMatrices]

                skin.joints = skin.joints.map(a => nodes[a])

                for (let i = 0; i < skin.joints.length; i++) {
                    skin.joints[i].id = i
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

        console.log(content)

        return content

        /** @type {Object.<string, {attributes: Object.<string, Float32Array>}>} */
        const result = {}

        for (const node of gltf_nodes) {
            const mesh_id = node.mesh

            if (mesh_id === undefined) continue

            const skin_id = node.skin

            let joints = []
            if (skin_id !== undefined) {
                const skin = gltf_skins[skin_id]
                joints = skin.joints

            }

            const node_name = node.name

            const gltf_mesh = gltf_meshes[mesh_id]

            const primitives = gltf_mesh.primitives

            const attributes = []

            for (const primitive of primitives) {
                const attribute = {}
                attributes.push(attribute)
                for (const key in primitive.attributes) {
                    const attribute_index = primitive.attributes[key]
                    attribute[key] = getTypedArrayFromBinary(gltf_accessors, gltf_bufferViews, gltf_uint8array, attribute_index)
                }
                attribute.indices = getTypedArrayFromBinary(gltf_accessors, gltf_bufferViews, gltf_uint8array, primitive.indices)
            }

            result[node_name] = {
                attibutes: attributes,

            }
        }
        console.log(gltf)
        return result
    }
}

const test = async (url = new URL('./blader.glb', import.meta.url)) => {
    const loader = new GLBLoader()
    const data = await loader.load(url)
    // console.log(data)
}

test()










