


const gltfTypeToSize = {
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'SCALAR': 1,
}

const classToType = {
    [Uint8Array]: 'UNSIGNED_BYTE',
    [Float32Array]: 'FLOAT',
    [Uint16Array]: 'UNSIGNED_SHORT',
}

class Attribute {
    /**
     * @param {} location 
     * @param {number} size 
     * @param {'VEC2' | 'VEC3' | 'VEC4' | 'SCALAR'} gltfType 
     * @param {'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' | 'STATIC_READ' | 'DYNAMIC_READ' | 'STREAM_READ' | 'STATIC_COPY' | 'DYNAMIC_COPY' | 'STREAM_COPY'} usage 
     */
    constructor(name, buffer, gltfType, usage = 'STATIC_DRAW') {
        /** @type {string} */
        this.name = name

        /** @type {number} */
        this.size = gltfTypeToSize[gltfType]

        /** @type {'BYTE' | 'SHORT' | 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'FLOAT'} */
        this.type = classToType[buffer.constructor]

        /** @param {'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' | 'STATIC_READ' | 'DYNAMIC_READ' | 'STREAM_READ' | 'STATIC_COPY' | 'DYNAMIC_COPY' | 'STREAM_COPY' */
        this.usage = usage

        /** @type {Uint8Array | Float32Array | Uint16Array} */
        this.buffer = buffer
    }
}

const instances = new Map()
export class Geometry {
    constructor(gltfPrimitive) {

        if (instances.has(gltfPrimitive)) {
            return instances.get(gltfPrimitive)
        }

        const attributes = gltfPrimitive.attributes
        this.primitives = {
            position: new Attribute('a_position', attributes.POSITION.buffer, attributes.POSITION.type),
            normal: new Attribute('a_normal', attributes.NORMAL.buffer, attributes.NORMAL.type)
        }
        let i = 0
        while (attributes[`TEXCOORD_${i}`]) {
            const name = i === 0 ? 'uv' : `uv${i + 1}`
            this.primitives[name] = new Attribute(`a_${name}`, attributes[`TEXCOORD_${i}`].buffer, attributes[`TEXCOORD_${i}`].type)
            i++
        }

        this.indices = gltfPrimitive.indices.buffer

        this.dispose = () => {
            instances.delete(gltfPrimitive)
        }
    }
}

export class SkinnedGeometry extends Geometry {
    constructor(gltfPrimitive) {

        super(gltfPrimitive)

        const attributes = gltfPrimitive.attributes

        let i = 0
        while (attributes[`JOINTS_${i}`]) {
            const name = i === 0 ? 'joints' : `joints${i + 1}`
            this.primitives[name] = new Attribute(`a_${name}`, attributes[`JOINTS_${i}`].buffer, attributes[`JOINTS_${i}`].type)
            i++
        }

        i = 0
        while (attributes[`WEIGHTS_${i}`]) {
            const name = i === 0 ? 'weights' : `weights${i + 1}`
            this.primitives[name] = new Attribute(`a_${name}`, attributes[`WEIGHTS_${i}`].buffer, attributes[`WEIGHTS_${i}`].type)
            i++
        }
    }
}








