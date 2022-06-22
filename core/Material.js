import { NO_BLENDING } from './Renderer.js'


export class Material {

    /**
     * 
     * @param {Object.<string, Attribute>} attributes 
     * @param {Object.<string, Number | Vector2 | Vector3 | Vector4 | Matrix4>} uniforms 
     * @param {string} vertexShader 
     * @param {string} fragmentShader 
     */
    constructor(
        options = {
            /** @type {Object.<string, Attribute>} */
            attributes: {},
            /** @type {Object.<string, Number | Vector2 | Vector3 | Vector4 | Matrix4>} */
            uniforms: {},
            vertexShader: ``,
            fragmentShader: ``,

            blending: NO_BLENDING,
            init: async () => { },
            destroy: () => { },

            depth_test: true,
            depth_write: true,
        }
    ) {
        this.vertexShader = options.vertexShader
        this.fragmentShader = options.fragmentShader
        this.uniforms = options.uniforms ?? {}
        this.attributes = options.attributes ?? {}
        this.blending = options.blending ?? NO_BLENDING
        this.init = options.init
        this.destroy = options.destroy
        this.depth_test = options.depth_test ?? true
        this.depth_write = options.depth_write ?? true
    }
}




