
import { Camera } from '../../core/renderer/Camera.js'
import { Material } from "../../core/models/Material.js"
import { Matrix4 } from "../../math/Matrix4.js"
import { Vector3 } from "../../math/Vector3.js"
import { Lights } from '../../core/renderer/Lights.js'

const uniforms = {
    u_worldMatrix: Matrix4,
    u_color: Vector3,
}


const vertexShader = `#version 300 es

${Camera.vs_pars}
${Lights.vs_pars}

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_worldMatrix;

out vec3 v_normal;
out vec4 v_worldPosition;

void main() {

    v_normal = mat3(u_worldMatrix) * a_normal;

    vec4 position = vec4(a_position, 1.);

    v_worldPosition = u_worldMatrix * position;

    gl_Position = u_projectionViewMatrix * v_worldPosition;

    ${Lights.vs_main}
}
`

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

uniform vec3 u_color;

in vec3 v_normal;
in vec4 v_worldPosition;

out vec4 color;

${Lights.fs_pars}

void main() {
    
    ${Lights.fs_main}

    color.a = 1.;
}
`

export const defaultMaterial = new Material({
    name: 'defaultMaterial',
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,

})