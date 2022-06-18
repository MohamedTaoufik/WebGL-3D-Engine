
export class Material {

    /**
     * 
     * @param {Object.<string, Attribute>} attributes 
     * @param {Object.<string, Number | Vector2 | Vector3 | Vector4 | Matrix4>} uniforms 
     * @param {string} vertexShader 
     * @param {string} fragmentShader 
     */
    constructor(
        attributes, uniforms,
        vertexShader, fragmentShader,
    ) {
        this.vertexShader = vertexShader
        this.fragmentShader = fragmentShader
        this.uniforms = uniforms
        this.attributes = attributes
    }
}




