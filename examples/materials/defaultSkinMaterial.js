











import { Camera } from '../../core/renderer/Camera.js'
import { Material } from "../../core/models/Material.js"
import { Matrix4 } from "../../math/Matrix4.js"
import { Vector3 } from "../../math/Vector3.js"
import { Lights } from '../../core/renderer/Lights.js'
import { TexParameters, UpdateParameters } from '../../core/renderer/Texture.js'

const uniforms = {
    u_worldMatrix: Matrix4,
    u_color: Vector3,
}

const textures = {
    'u_jointTexture': {
        createData(geometry) {
            const length = geometry.primitives.joints.buffer.length
            this.updateParameters.height = length / 16
            return new Float32Array(length)
        },
        texParameters: new TexParameters({
            TEXTURE_WRAP_S: 'CLAMP_TO_EDGE',
            TEXTURE_WRAP_T: 'CLAMP_TO_EDGE',
            TEXTURE_MIN_FILTER: 'NEAREST',
            TEXTURE_MAG_FILTER: 'NEAREST',
            UNPACK_PREMULTIPLY_ALPHA_WEBGL: false,
        }),
        updateParameters: new UpdateParameters({
            target: 'TEXTURE_2D',
            level: 0,
            internalformat: 'RGBA32F',
            width: 4,
            height: 0,
            border: 0,
            format: 'RGBA',
            type: 'FLOAT',
        }),
        drawLevel: 'object',
    }
}

const vertexShader = `#version 300 es

${Camera.vs_pars}
${Lights.vs_pars}

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;
in vec4 a_weights;
in uvec4 a_joints;

uniform mat4 u_worldMatrix;
uniform sampler2D u_jointTexture;

mat4 getBoneMatrix(uint jointNdx) {
    return mat4(
      texelFetch(u_jointTexture, ivec2(0, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(1, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(2, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(3, jointNdx), 0));
  }

out vec3 v_normal;
out vec4 v_worldPosition;
out vec3 v_debug;
void main() {
    mat4 skinMatrix = getBoneMatrix(a_joints[0]) * a_weights[0] +
                        getBoneMatrix(a_joints[1]) * a_weights[1] +
                        getBoneMatrix(a_joints[2]) * a_weights[2] +
                        getBoneMatrix(a_joints[3]) * a_weights[3];
    // v_debug = skinMatrix[0].xyz;// vec3(a_joints.xyz);// texelFetch(u_jointTexture, ivec2(0, 0), 0).xyz;
    mat4 world = u_worldMatrix * skinMatrix;  
    // mat4 world = u_worldMatrix;  

    
    v_normal = normalize(vec3(inverse(transpose(world)) * vec4(a_normal, 0.0)));
    // v_normal = mat3(world) * a_normal;

    vec4 position = vec4(a_position, 1.);

    v_worldPosition = world * position;

    gl_Position = u_projectionViewMatrix * v_worldPosition;

    ${Lights.vs_main}
}`

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

uniform vec3 u_color;

in vec3 v_normal;
in vec4 v_worldPosition;

out vec4 color;

${Lights.fs_pars}

in vec3 v_debug;

void main() {
    
    color.a = 1.;
    // color.xyz = u_color;
    color.xyz = v_normal;
    // color.xyz = v_debug;
    
    ${Lights.fs_main}
}
`

export const defaultSkinMaterial = new Material({
    name: 'defaultSkinMaterial',
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    textures: textures,
})