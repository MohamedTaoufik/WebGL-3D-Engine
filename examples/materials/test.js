import { Attribute } from "../../core/Attribute.js"
import { Camera } from '../../core/Camera.js'
import { DirectionalLights } from '../../core/DirectionalLights.js'
import { Material } from "../../core/Material.js"
import { PointLights } from '../../core/PointLights.js'
import { Matrix4 } from "../../math/Matrix4.js"
import { Vector3 } from "../../math/Vector3.js"
import { Vector4 } from "../../math/Vector4.js"
import { mat3_glsl } from '../../shader_lib/math/mat3.js'

const uniforms = {
    worldMatrix: new Matrix4(),
    u_color: new Vector3(0, 0, 1),
    u_reverseLightDirection: new Vector3(0, -1, -1).normalize()
}

const attributes = {
    a_position: new Attribute(3),
    a_normal: new Attribute(3),
}

const vertexShader = `#version 300 es

${Camera.vs_pars}
${PointLights.vs_pars}

in vec3 a_position;
in vec3 a_normal;

uniform mat4 worldMatrix;

out vec3 v_normal;
out vec4 v_worldPosition;

void main() {
    // v_normal = transpose(inverse(mat3(u_worldCameraMatrix))) * a_normal;
    v_normal = mat3(worldMatrix) * a_normal;
    v_worldPosition = worldMatrix * vec4(a_position, 1);

    gl_Position = u_projectionViewMatrix * v_worldPosition;

    ${PointLights.vs_main}
}
`

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

uniform vec3 u_color;

in vec3 v_normal;
in vec4 v_worldPosition;

out vec4 color;

${DirectionalLights.fs_pars}
${PointLights.fs_pars}

void main() {

    vec3 diffuse;
    vec3 specular;

    ${DirectionalLights.fs_function}(v_normal,diffuse);
    ${PointLights.fs_function}(v_normal,diffuse, specular);

    color.rgb = u_color * diffuse;// + specular;
    color.a = 1.;
}
`

export const test_mat = new Material({

    attributes: attributes,
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,

})