import { Attribute } from "../../core/Attribute.js"
import { Material } from "../../core/Material.js"
import { Matrix4 } from "../../math/Matrix4.js"
import { Vector3 } from "../../math/Vector3.js"
import { Vector4 } from "../../math/Vector4.js"

const uniforms = {
    worldMatrix: new Matrix4(),
    u_color: new Vector4(0, 0, 1, 1),
    u_reverseLightDirection: new Vector3(0, -1, -1).normalize()
}

const attributes = {
    a_position: new Attribute(3),
    a_normal: new Attribute(3),
}

const vertexShader = /* glsl */`
attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 projectionViewMatrix;
uniform mat4 worldCameraMatrix;
uniform mat4 worldMatrix;

varying vec3 v_normal;

void main() {
    v_normal = mat3(worldCameraMatrix) * a_normal;
    gl_Position = projectionViewMatrix * worldMatrix * vec4(a_position, 1);

}
`

const fragmentShader = /* glsl */`
precision highp float;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

varying vec3 v_normal;

void main() {
    float light = dot(v_normal, u_reverseLightDirection);

    gl_FragColor = u_color;

    gl_FragColor.rgb *= light;


}
`

export const test_mat = new Material(attributes, uniforms, vertexShader, fragmentShader)