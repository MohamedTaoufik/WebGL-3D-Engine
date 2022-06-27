import { Vector3 } from '../../math/Vector3.js'




const QUALITY = 10
const DIRECTIONAL_LIGHT_MAX_COUNT = 5
const POINT_LIGHT_MAX_COUNT = 20

const vs_pars = `

struct DirLight {
    vec3 direction;
    vec3 diffuse;
    float visible;
};

struct PointLight {
    vec3 position;
    vec3 diffuse;
    float visible;
};

layout(std140) uniform UBO_lights {
    DirLight dirLights[${DIRECTIONAL_LIGHT_MAX_COUNT}];
    PointLight pointLights[${POINT_LIGHT_MAX_COUNT}];
};

out vec3 v_surfaceToView;
`

const vs_main = `
v_surfaceToView = vec3( u_cameraPosition ) - v_worldPosition.xyz;
`

const fs_pars = `

struct DirLight {
    vec3 direction;
    vec3 diffuse;
    float visible;
};

struct PointLight {
    vec3 position;
    vec3 diffuse;
    float visible;
};

layout(std140) uniform UBO_lights {
    DirLight dirLights[${DIRECTIONAL_LIGHT_MAX_COUNT}];
    PointLight pointLights[${POINT_LIGHT_MAX_COUNT}];
};

in vec3 v_surfaceToView;

void calcDirLights(vec3 v_normal, out vec3 diffuse){
    vec3 result;

    for(int i = 0; i < ${DIRECTIONAL_LIGHT_MAX_COUNT}; i++){
        if(dirLights[i].visible > 0.5){
            diffuse += dirLights[i].diffuse * dot(v_normal, -dirLights[i].direction)/2.+.5;
        }
    }
    return;
}

void calcPointLights(vec3 normal, out vec3 diffuse, out vec3 specular){

    vec3 surfaceToViewDirection = normalize(v_surfaceToView); // specular

    for(int i = 0; i < ${POINT_LIGHT_MAX_COUNT}; i++){

        if(pointLights[i].visible > 0.5){
            
            vec3 surfaceToPointLight = pointLights[i].position - v_worldPosition.xyz;

            float surfaceToPointLight_length = length( surfaceToPointLight );

            // TODO skip if light too far

            vec3 surfaceToPointLight_normalized = surfaceToPointLight / surfaceToPointLight_length;

            // diffuse
            float light = max(dot(normal, surfaceToPointLight_normalized ), 0.0);
            float lightAttenuation  = 0.1 / (surfaceToPointLight_length * surfaceToPointLight_length);
            diffuse += pointLights[i].diffuse * light * lightAttenuation;        

            // specular
            ${QUALITY < 0 ? '' :
            `vec3 halfVector = normalize(surfaceToPointLight_normalized + surfaceToViewDirection);
            specular += pointLights[i].diffuse * pow( max( dot(normal, halfVector), 0.0), 1000.) * lightAttenuation;`}
        }
    }
}
`

const fs_main = `

vec3 diffuse;
vec3 specular;

// calcDirLights(v_normal, diffuse);
calcPointLights(v_normal, diffuse, specular);

color.rgb = (color.rgb * 0.8 + 0.2) * (diffuse + specular);
color.rgb = pow(color.rgb, vec3(1.0 / 2.2));
`

class DirectionalLight {
    visible = 0
    direction = new Vector3()
    diffuse = new Vector3()
}

class PointLight {
    visible = 0
    position = new Vector3()
    diffuse = new Vector3()
}

export class Lights {
    static vs_pars = vs_pars
    static vs_main = vs_main
    static fs_pars = fs_pars
    static fs_main = fs_main

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl) {
        /** @type {[DirectionalLight]} */
        const dirLights = []
        /** @type {[PointLight]} */
        const pointLights = []

        for (let i = 0; i < DIRECTIONAL_LIGHT_MAX_COUNT; i++)
            dirLights.push(new DirectionalLight())
        for (let i = 0; i < POINT_LIGHT_MAX_COUNT; i++)
            pointLights.push(new PointLight())


        /** @returns {DirectionalLight | undefined} */
        this.getPointLight = () => {
            for (let i = 0; i < POINT_LIGHT_MAX_COUNT; i++) {
                if (pointLights[i].visible === 0) {
                    pointLights[i].visible = 1
                    return pointLights[i]
                }
            }
        }
        this.getDirectionalLight = () => {
            for (let i = 0; i < DIRECTIONAL_LIGHT_MAX_COUNT; i++) {
                if (dirLights[i].visible === 0) {
                    dirLights[i].visible = 1
                    return dirLights[i]
                }
            }
        }


        this.freeLight = (light) => {
            light.visible = 0
        }

        this.freeAll = () => {
            for (let i = 0; i < DIRECTIONAL_LIGHT_MAX_COUNT; i++)
                dirLights[i].visible = 0
            for (let i = 0; i < POINT_LIGHT_MAX_COUNT; i++)
                pointLights[i].visible = 0
        }

        this.needsUpdate = true

        this.UBO_index = 1
        const UBO_buffer = gl.createBuffer()
        const UBO_data = new Float32Array(
            8 * DIRECTIONAL_LIGHT_MAX_COUNT
            + 8 * POINT_LIGHT_MAX_COUNT
        )
        gl.bindBuffer(gl.UNIFORM_BUFFER, UBO_buffer)
        gl.bufferData(gl.UNIFORM_BUFFER, UBO_data, gl.DYNAMIC_DRAW)
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.UBO_index, UBO_buffer)

        const pointLight_offset = 8 * DIRECTIONAL_LIGHT_MAX_COUNT


        this.update_UBO = () => {

            for (let i = 0; i < DIRECTIONAL_LIGHT_MAX_COUNT; i++) {
                const light = dirLights[i]
                if (light.visible === 1) {
                    light.direction.toArray(UBO_data, i * 8)
                    light.diffuse.toArray(UBO_data, i * 8 + 4)
                    UBO_data[i * 8 + 7] = 1
                } else {
                    UBO_data[i * 8 + 7] = 0
                }
            }

            for (let i = 0; i < POINT_LIGHT_MAX_COUNT; i++) {
                const light = pointLights[i]
                if (light.visible === 1) {
                    light.position.toArray(UBO_data, pointLight_offset + i * 8)
                    light.diffuse.toArray(UBO_data, pointLight_offset + i * 8 + 4)
                    UBO_data[pointLight_offset + i * 8 + 7] = 1
                } else {
                    UBO_data[pointLight_offset + i * 8 + 7] = 0
                }
            }

            gl.bindBuffer(gl.UNIFORM_BUFFER, UBO_buffer)
            gl.bufferData(gl.UNIFORM_BUFFER, UBO_data, gl.DYNAMIC_DRAW)
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this.UBO_index, UBO_buffer)
        }
    }
}





