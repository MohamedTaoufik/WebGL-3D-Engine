

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
    [5126]: Float32Array,
    [5123]: Uint16Array,
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

        const gltf_nodes = gltf.content.nodes
        const gltf_meshes = gltf.content.meshes
        const gltf_accessors = gltf.content.accessors
        const gltf_bufferViews = gltf.content.bufferViews
        const gltf_uint8array = new Uint8Array(gltf.body)

        /** @type {Object.<string, {attributes: Object.<string, Float32Array>}>} */
        const result = {}

        for (const scene of gltf.content.scenes) {
            for (const node_id of scene.nodes) {
                const node = gltf_nodes[node_id]
                const mesh_id = node.mesh

                if (mesh_id === undefined) continue
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
                    attibutes: attributes
                }

            }

        }
        console.log(gltf)
        return result
    }
}

const test = async (url = new URL('./test.glb', import.meta.url)) => {
    const loader = new GLBLoader()
    const data = await loader.load(url)
    console.log(data)
}

test()










