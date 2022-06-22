import { Attribute } from "../../core/Attribute.js"
import { Camera } from '../../core/Camera.js'
import { DirectionalLights } from '../../core/DirectionalLights.js'
import { Material } from "../../core/Material.js"
import { PointLights } from '../../core/PointLights.js'
import { ADDITIVE_BLENDING } from '../../core/Renderer.js'
import { Matrix4 } from "../../math/Matrix4.js"
import { Vector3 } from "../../math/Vector3.js"
import { Vector4 } from "../../math/Vector4.js"
import { mat3_glsl } from '../../shader_lib/math/mat3.js'

const uniforms = {
    worldMatrix: new Matrix4(),
    u_color: new Vector3(0, 0, 1),
    texture1: new Image(),
}

const init = () => {
    return new Promise((resolve) => {
        uniforms.texture1.onload = resolve
        uniforms.texture1.src = new URL('./spark.svg', import.meta.url).href
    })
}

const destroy = () => {
    uniforms.texture1 = undefined
}

const attributes = {}

const vertexShader = `#version 300 es

${Camera.vs_pars}

uniform mat4 worldMatrix;

void main() {

    gl_PointSize *= 50. * length( worldMatrix[3].xyz );

    gl_Position = u_projectionViewMatrix * worldMatrix * vec4(0., 0., 0., 1.);
}
`

const fragmentShader = `#version 300 es
precision highp float;

uniform vec3 u_color;

uniform sampler2D texture1;

out vec4 color;

void main() {

    color = texture(texture1,  gl_PointCoord.xy);
    
    // color.a = .5;

}
`

export const point_mat = new Material(
    {
        attributes: attributes,
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        init: init,
        destroy: destroy,
        blending: ADDITIVE_BLENDING,
        // depth_test: false,
        depth_write: false,
    }
)

