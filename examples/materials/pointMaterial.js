
import { Camera } from '../../core/renderer/Camera.js'
import { Lights } from '../../core/renderer/Lights.js'
import { Material } from "../../core/models/Material.js"
import { ADDITIVE_BLENDING } from '../../core/renderer/Renderer.js' 
import { Matrix4 } from "../../math/Matrix4.js"
import { Vector3 } from "../../math/Vector3.js"
import { Vector4 } from "../../math/Vector4.js"
import { mat3_glsl } from '../../shader_lib/math/mat3.js'

const uniforms = {
    u_worldMatrix: Matrix4,
    u_color: Vector3,
    texture1: Image,
}

const init = () => {
    // return new Promise((resolve) => {
    //     uniforms.texture1.onload = resolve
    //     uniforms.texture1.src = new URL('./spark.svg', import.meta.url).href
    // })
}

const destroy = () => {
    uniforms.texture1 = undefined
}


const vertexShader = `#version 300 es

${Camera.vs_pars}

out vec4 v_worldPosition;
${Lights.vs_pars}


uniform mat4 u_worldMatrix;

void main() {

    

    gl_Position = u_projectionViewMatrix * u_worldMatrix * vec4(0., 0., 0., 1.);
    gl_PointSize *= 300. / gl_Position.z;
}`

const fragmentShader = `#version 300 es
precision highp float;

in vec4 v_worldPosition;
${Lights.fs_pars}

uniform vec3 u_color;

uniform sampler2D texture1;

out vec4 color;

void main() {

    color = texture(texture1,  gl_PointCoord.xy);
    
    // color.a = .5;

}
`

export const pointMaterial = new Material(
    {
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        init: init,
        destroy: destroy,
        blending: ADDITIVE_BLENDING,
        depth_test: true,
        depthWrite: false,
    }
)

