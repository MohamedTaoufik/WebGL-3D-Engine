import { NO_BLENDING } from '../renderer/Renderer.js'
import { TexParameters, UpdateParameters } from '../renderer/Texture.js'


const _param = {
    /** @type {Object.<string, Number | Vector2 | Vector3 | Vector4 | Matrix4>} */
    uniforms: {},
    vertexShader: ``,
    fragmentShader: ``,

    blending: NO_BLENDING,

    init: async () => { },
    destroy: () => { },

    depthTest: true,
    depthWrite: true,

    textures: {
        createData() { },
        texParameters: new TexParameters(),
        updateParameters: new UpdateParameters(),
        drawLevel: 'object',
    }
}

export class Material {

    /**
     * 
     * @param {Object.<string, Attribute>} attributes 
     * @param {Object.<string, Number | Vector2 | Vector3 | Vector4 | Matrix4>} uniforms 
     * @param {string} vertexShader 
     * @param {string} fragmentShader 
     */
    constructor(p = _param) {
        this.name = p.name
        this.uniforms = p.uniforms ?? {}
        this.vertexShader = p.vertexShader
        this.fragmentShader = p.fragmentShader

        this.init = p.init
        this.destroy = p.destroy

        this.blending = p.blending ?? _param.blending
        this.depthTest = p.depthTest ?? _param.depthTest
        this.depthWrite = p.depthWrite ?? _param.depthWrite

        this.textures = p.textures ?? {}
    }
}




