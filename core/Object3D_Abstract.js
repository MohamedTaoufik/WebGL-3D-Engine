


export class Object3D_Abstract {
    /**
     * 
     * @param {Material} material 
     * @param {Object.<string, TypedArray>} attributes 
     */
    constructor(material, attributes = {}) {

        const a = material.getAttributes(attributes)
        this.vao = a.vao
        this.attributes_update = a.attributes_update

        this.attributes = attributes


        this.drawArrayCount = attributes.a_position.length / 3

        material.objects.add(this)

        this.super_dispose = () => {

            material.objects.delete(this)

        }
    }
}










