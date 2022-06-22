


export class Object3D_Abstract {
    /**
     * 
     * @param {Program} program 
     * @param {Object.<string, TypedArray>} attributes 
     */
    constructor(program, attributes = {}, indices) {

        const a = program.getAttributes(attributes, indices)
        this.vao = a.vao
        this.attributes_update = a.attributes_update

        this.attributes = attributes

        program.objects.add(this)

        this.super_dispose = () => {

            program.objects.delete(this)

        }
    }
}










