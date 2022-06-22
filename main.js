"use strict"

import { Renderer } from './core/Renderer.js'
import { Program } from './core/Program.js'
import { F } from './examples/objects/F.js'
import { OrbitControls } from './utils/OrbitControls.js'
import { Cursor_View } from './debug/Cursor_View.js'
import { test_mat } from './examples/materials/test.js'
import { Loop } from './utils/Loop.js'
import { Plane } from './examples/objects/plane.js'
import { Vector3 } from './math/Vector3.js'
import { Quaternion } from './math/Quaternion.js'
import { Euler } from './math/Euler.js'
import { Box } from './examples/objects/Box.js'
import { Spherical } from './math/Spherical.js'
import { PI, PI05, PI2 } from './math/MathUtils.js'
import { Point } from './examples/objects/Point.js'
import { point_mat } from './examples/materials/point.js'


const directional_lights_init = (renderer) => {
    const directional_lights = renderer.directional_lights

    const dirLight = directional_lights.get_light()
    dirLight.diffuse.set(1, 1, 1)
    dirLight.direction.set(0, 1, 0).normalize()

    const dirLight2 = directional_lights.get_light()
    dirLight2.diffuse.set(1, 1, 1)
    dirLight2.direction.set(1, 0, 0).normalize()

    directional_lights.needsUpdate = true
}

await point_mat.init()

const POINT_LIGHT_TEST_COUNT = 20
const point_lights_init = (/**@type {Renderer}*/ renderer) => {
    const lights = renderer.point_lights

    const program = new Program(renderer, point_mat)

    const updates = []
    for (let i = 0; i < POINT_LIGHT_TEST_COUNT; i++) {
        const object = new Point(program)

        const light = lights.get_light()
        const spherical = new Spherical(1.1, Math.random() * PI2, Math.random() * PI2)
        light.diffuse.set(1, 1, 1)

        let age = 0
        updates.push((dt) => {

            // age += dt
            // light.position.y = 0.65 + Math.cos(age) / 5
            // light.position.x = 0

            spherical.phi += Math.sin(dt) * 0.1
            spherical.phi += Math.cos(dt) * 0.01
            light.position.setFromSpherical(spherical)
            object.worldMatrix.position.copy(light.position)
        })
    }
    const update = (dt) => {
        for (let i = 0; i < POINT_LIGHT_TEST_COUNT; i++) {
            updates[i](dt)
        }
        lights.needsUpdate = true
    }
    renderer.on_before_render.add(update)
}

const init = () => {
    const renderer = new Renderer()
    document.body.appendChild(renderer.canvas)
    renderer.canvas.width = '100%'
    renderer.canvas.height = '100%'
    const cam = renderer.camera

    new OrbitControls(renderer.camera, renderer.canvas, renderer.on_before_render)

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    document.body.appendChild(container)
    // const cursor_x = new Cursor_View('cam pos X', (value) => { cam.position.x = value; cam.projectionViewMatrixNeedsUpdate = true; cam.lookAt(0, 0, 0) })
    // const cursor_y = new Cursor_View('cam pos Y', (value) => { cam.position.y = value; cam.projectionViewMatrixNeedsUpdate = true; cam.lookAt(0, 0, 0) })
    // const cursor_z = new Cursor_View('cam pos Z', (value) => { cam.position.z = value; cam.projectionViewMatrixNeedsUpdate = true; cam.lookAt(0, 0, 0) })
    // container.append(cursor_x.container, cursor_y.container, cursor_z.container)

    const cam_pos = new Vector3()
    const cam_quat = new Quaternion()
    const cam_euler = new Euler()
    const cam_scale = new Vector3()

    const decompose_cam = document.createElement('span')
    container.appendChild(decompose_cam)
    renderer.on_before_render.add(() => {
        cam.worldCameraMatrix.decompose(cam_pos, cam_quat, cam_scale)
        cam_euler.setFromQuaternion(cam_quat)
        decompose_cam.innerHTML = `
        cam pos: ${cam_pos.x.toFixed(1)}, ${cam_pos.y.toFixed(1)}, ${cam_pos.z.toFixed(1)}<br>
        cam euler: ${cam_euler.x.toFixed(1)}, ${cam_euler.y.toFixed(1)}, ${cam_euler.z.toFixed(1)}<br>
`
    })

    const program = new Program(renderer, test_mat)

    const object = new Box(program)
    const object2 = new Box(program)

    object2.worldMatrix.position.x = 2

    new Loop(renderer.draw)

    // directional_lights_init(renderer)
    point_lights_init(renderer)
}

init()
