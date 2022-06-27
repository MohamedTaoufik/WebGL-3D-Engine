


const instances = new Map()
export class Texture {

    /**
     * @param {Renderer} renderer
     * @param {Image | HTMLImageElement | HTMLVideoElement} data 
     * @returns 
     */
    constructor(renderer, data) {
        if (instances.has(data)) {
            return instances.get(data)
        }
        instances.set(data, this)
        
        const gl = renderer.gl

        this.data = data

        this.texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

        this.update = () => {
            
            gl.bindTexture(gl.TEXTURE_2D, this.texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.data)
        }
        this.update()
    }
}











