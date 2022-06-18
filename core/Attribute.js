


export class Attribute {
    /**
     * 
     * @param {number} size 
     * @param {'BYTE' | 'SHORT' | 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'FLOAT'} type 
     * @param {'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' | 'STATIC_READ' | 'DYNAMIC_READ' | 'STREAM_READ' | 'STATIC_COPY' | 'DYNAMIC_COPY' | 'STREAM_COPY'} usage 
     */
    constructor(size = 3, type = 'FLOAT', usage = 'STATIC_DRAW') {
        this.size = size
        this.type = type
        this.usage = usage
    }
}








