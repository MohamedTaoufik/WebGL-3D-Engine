import { Vector3 } from '../math/Vector3.js'



const MAX_COUNT = 5

const fs_pars = `

struct DirLight {
    vec3 direction;
    vec3 diffuse;
    int visible;
};  

uniform DirLight dirLights[${MAX_COUNT}];

void calcDirLights(vec3 v_normal, out vec3 diffuse){
    vec3 result;

    for(int i = 0; i < ${MAX_COUNT}; i++){
        if(dirLights[i].visible == 1){
            diffuse += dirLights[i].diffuse * dot(v_normal, -dirLights[i].direction)/2.+.5;
        }
    }
    return;
}

`

const fs_function = `calcDirLights`

class DirectionalLight {
    visible = 0
    direction = new Vector3()
    diffuse = new Vector3()
}

const vector_3_typed_array = new Float32Array(3)

export class DirectionalLights {
    static MAX_COUNT = MAX_COUNT
    static fs_pars = fs_pars
    static fs_function = fs_function

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     */
    constructor(gl) {
        /** @type {[DirectionalLight]} */
        const lights = []

        for (let i = 0; i < MAX_COUNT; i++) {
            lights.push(new DirectionalLight())
        }

        /** @returns {DirectionalLight | undefined} */
        this.get_light = () => {
            for (let i = 0; i < MAX_COUNT; i++) {
                if (lights[i].visible === 0) {
                    lights[i].visible = 1
                    return lights[i]
                }
            }
        }

        this.free_light = (light) => {
            light.visible = false
        }

        this.free_all = () => {
            for (let i = 0; i < MAX_COUNT; i++)
                lights[i].visible = 0
        }

        this.needsUpdate = true

        this.update_uniform = (program) => {
            for (let i = 0; i < MAX_COUNT; i++) {
                const light = lights[i]
                {
                    const location = gl.getUniformLocation(program, `dirLights[${i}].visible`)
                    gl.uniform1i(location, light.visible)
                }
                if (light.visible === 1) {
                    {
                        const location = gl.getUniformLocation(program, `dirLights[${i}].diffuse`)
                        light.diffuse.toArray(vector_3_typed_array)
                        gl.uniform3fv(location, vector_3_typed_array)
                    } {
                        const location = gl.getUniformLocation(program, `dirLights[${i}].direction`)
                        light.direction.toArray(vector_3_typed_array)
                        gl.uniform3fv(location, vector_3_typed_array)
                    }
                }
            }
        }
    }
}








