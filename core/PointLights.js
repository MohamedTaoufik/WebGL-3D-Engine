import { Vector3 } from '../math/Vector3.js'



const MAX_COUNT = 20

const vs_pars = `

struct PointLight {
    vec3 position;
    vec3 diffuse;
    int visible;
};  

uniform PointLight pointLights[${MAX_COUNT}];

out vec3 v_surfaceToPointLight[${MAX_COUNT}];
out vec3 v_surfaceToView;

`

const vs_main = `
v_surfaceToView = vec3( u_worldCameraMatrix[0].w, u_worldCameraMatrix[1].w, u_worldCameraMatrix[2].w ) - v_worldPosition.xyz;
`

const fs_pars = `

struct PointLight {
    vec3 position;
    vec3 diffuse;
    int visible;
};  

uniform PointLight pointLights[${MAX_COUNT}];

in vec3 v_surfaceToPointLight[${MAX_COUNT}];
in vec3 v_surfaceToView;

void calcPointLights(vec3 normal, out vec3 diffuse, out vec3 specular){

    vec3 surfaceToViewDirection = normalize(v_surfaceToView); // specular

    for(int i = 0; i < ${MAX_COUNT}; i++){

        if(pointLights[i].visible == 1){

            vec3 surfaceToPointLight = pointLights[i].position - v_worldPosition.xyz;

            
            // diffuse
            float light = dot(normal, normalize( surfaceToPointLight ) );
            
            float surfaceToPointLight_length = length( surfaceToPointLight );
            
            float lightAttenuation  = 0.5 / pow(surfaceToPointLight_length, 0.5 );

            // float light = dot( normal, normalize( v_surfaceToPointLight[i] ) );
            if(light > 0.0){
                diffuse += pointLights[i].diffuse * light * lightAttenuation;
            }

            // specular
            vec3 surfaceToLightDirection = normalize(surfaceToPointLight);

            // vec3 surfaceToLightDirection = normalize(v_surfaceToPointLight[i]);
            vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);   
            light = dot(normal, halfVector);
            if(light > 0.0){
                specular += pow(light, 4.);
            }
        }
    }
}
`

const fs_function = `calcPointLights`

class DirectionalLight {
    visible = 0
    position = new Vector3()
    diffuse = new Vector3()
}

const vector_3_typed_array = new Float32Array(3)

export class PointLights {
    static MAX_COUNT = MAX_COUNT
    static vs_pars = vs_pars
    static vs_main = vs_main
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
                    const location = gl.getUniformLocation(program, `pointLights[${i}].visible`)
                    gl.uniform1i(location, light.visible)
                }
                if (light.visible === 1) {
                    {
                        const location = gl.getUniformLocation(program, `pointLights[${i}].diffuse`)
                        light.diffuse.toArray(vector_3_typed_array)
                        gl.uniform3fv(location, vector_3_typed_array)
                    } {
                        const location = gl.getUniformLocation(program, `pointLights[${i}].position`)
                        light.position.toArray(vector_3_typed_array)
                        gl.uniform3fv(location, vector_3_typed_array)
                    }
                }
            }
        }
    }
}








