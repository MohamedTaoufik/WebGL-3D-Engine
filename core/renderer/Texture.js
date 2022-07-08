








const instances = new Map()

export class UpdateParameters {
    /** @type {'TEXTURE_2D' | 'TEXTURE_CUBE_MAP_POSITIVE_X' | 'TEXTURE_CUBE_MAP_NEGATIVE_X' | 'TEXTURE_CUBE_MAP_POSITIVE_Y' | 'TEXTURE_CUBE_MAP_NEGATIVE_Y' | 'TEXTURE_CUBE_MAP_POSITIVE_Z' | 'TEXTURE_CUBE_MAP_NEGATIVE_Z'} */
    target = 'TEXTURE_2D'
    level = 0
    /** @type {'ALPHA'| 'RGB'|'RGBA'|'LUMINANCE'|'LUMINANCE_ALPHA'|'DEPTH_COMPONENT' |'DEPTH_STENCIL' |'R8'|'R16F'|'R32F'|'R8UI'|'RG8'|'RG16F'|'RG32F'|'RG8UI'|'RG16UI'|'RG32UI'|'RGB8'|'SRGB8'|'RGB565'|'R11F_G11F_B10F'|'RGB9_E5'|'RGB16F'|'RGB32F'|'RGB8UI'|'RGBA8'|'SRGB8_APLHA8'|'RGB5_A1'|'RGB10_A2'|'RGBA4'|'RGBA16F'|'RGBA32F'|'RGBA8UI'} */
    internalformat = 'RGBA'
    width = 0
    height = 0
    border = 0
    /** @type {'RGB' | 'RGBA' | 'LUMINANCE_ALPHA' | 'LUMINANCE'	| 'ALPHA' | 'RED' | 'RED_INTEGER' | 'RG' | 'RG_INTEGER' | 'RGB_INTEGER' | 'RGBA_INTEGER'} */
    format = 'RGBA'
    /** @type {'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_5_6_5' | 'UNSIGNED_SHORT_4_4_4_4' | 'UNSIGNED_SHORT_5_5_5_1' | 'HALF_FLOAT' | 'FLOAT' | 'UNSIGNED_INT_10F_11F_11F_REV' | 'HALF_FLOAT' | 'UNSIGNED_INT_2_10_10_10_REV'} */
    type = 'UNSIGNED_BYTE'

    constructor(/** @type {UpdateParameters} */params = {}) {
        if (params.target) this.target = params.target
        if (params.level) this.level = params.level
        if (params.internalformat) this.internalformat = params.internalformat
        if (params.width) this.width = params.width
        if (params.height) this.height = params.height
        if (params.border) this.border = params.border
        if (params.format) this.format = params.format
        if (params.type) this.type = params.type
    }
}

export class TexParameters {
    /**@type {'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT'} */
    'TEXTURE_WRAP_S' = 'CLAMP_TO_EDGE'
    /**@type {'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT'} */
    'TEXTURE_WRAP_T' = 'CLAMP_TO_EDGE'
    /**@type {'LINEAR' | 'NEAREST' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_LINEAR'} */
    'TEXTURE_MIN_FILTER' = 'LINEAR'
    /**@type {'LINEAR' | 'NEAREST'} */
    'TEXTURE_MAG_FILTER' = 'LINEAR'

    'UNPACK_PREMULTIPLY_ALPHA_WEBGL' = true

    constructor(/** @type {TexParameters} */params = {}) {
        if (params.TEXTURE_WRAP_S) this.TEXTURE_WRAP_S = params.TEXTURE_WRAP_S
        if (params.TEXTURE_WRAP_T) this.TEXTURE_WRAP_T = params.TEXTURE_WRAP_T
        if (params.TEXTURE_MIN_FILTER) this.TEXTURE_MIN_FILTER = params.TEXTURE_MIN_FILTER
        if (params.TEXTURE_MAG_FILTER) this.TEXTURE_MAG_FILTER = params.TEXTURE_MAG_FILTER
        if (params.UNPACK_PREMULTIPLY_ALPHA_WEBGL) this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = params.UNPACK_PREMULTIPLY_ALPHA_WEBGL
    }
}

/**@type {TexParameters} */
const texParametersImageDefault = {
    'TEXTURE_WRAP_S': 'CLAMP_TO_EDGE',
    'TEXTURE_WRAP_T': 'CLAMP_TO_EDGE',
    'TEXTURE_MIN_FILTER': 'LINEAR',
    'TEXTURE_MAG_FILTER': 'LINEAR',
    'UNPACK_PREMULTIPLY_ALPHA_WEBGL': true,
}
/**@type {TexParameters} */
const texParametersDataDefault = {
    'TEXTURE_WRAP_S': 'CLAMP_TO_EDGE',
    'TEXTURE_WRAP_T': 'CLAMP_TO_EDGE',
    'TEXTURE_MIN_FILTER': 'NEAREST',
    'TEXTURE_MAG_FILTER': 'NEAREST',
    'UNPACK_PREMULTIPLY_ALPHA_WEBGL': false,
}

let id = 0

export class Texture {

    /**
     * @param {Renderer} renderer
     * @param {Image | HTMLImageElement | HTMLVideoElement} data 
     * @returns 
     */
    constructor(gl, uniformName, data, parameters = {}, updateParameters = {}) {

        this.id = id++

        if (instances.has(data)) {
            return instances.get(data)
        }
        instances.set(data, this)

        const dataConstructor = data.constructor
        const isImage = dataConstructor === Image || dataConstructor === HTMLImageElement

        this.data = data

        const texture = gl.createTexture()

        this.texParameter = isImage ? texParametersImageDefault : texParametersDataDefault
        Object.seal(this.texParameter)
        for (const key in this.texParameter) if (parameters[key]) this.texParameter[key] = parameters[key]

        const target = gl[updateParameters.target ?? 'TEXTURE_2D']
        const level = updateParameters.level ?? 0
        const internalformat = gl[updateParameters.internalformat ?? 'RGBA']
        let width = updateParameters.width ?? data.width
        let height = updateParameters.height ?? data.height
        const border = updateParameters.border ?? 0
        const format = gl[updateParameters.format ?? 'RGBA']
        const type = gl[updateParameters.type ?? 'UNSIGNED_BYTE']

        this.updateParameters = () => {
            gl.bindTexture(target, texture)
            gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl[this.texParameter['TEXTURE_WRAP_S']])
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl[this.texParameter['TEXTURE_WRAP_T']])
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl[this.texParameter['TEXTURE_MIN_FILTER']])
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl[this.texParameter['TEXTURE_MAG_FILTER']])
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl[this.texParameter['UNPACK_PREMULTIPLY_ALPHA_WEBGL']])
        }
        this.updateParameters()

        this.draw = (programTextureDictionary) => {
            gl.activeTexture(programTextureDictionary[uniformName])
            gl.bindTexture(target, texture)
            if (this.needsDataUpdate === true) {
                gl.texImage2D(target, level, internalformat, width, height, border,
                    format, type, data)
                this.needsDataUpdate = false
            }
        }

        this.needsDataUpdate = false
        if (isImage === true) {
            data.onload = () => {
                width = data.width
                height = data.height
                this.needsDataUpdate = true
            }
        } else {
            this.needsDataUpdate = true
        }

        this.dispose = () => {
            gl.deleteTexture(texture)
            if (isImage === true) data.onload = undefined
        }
    }
}











