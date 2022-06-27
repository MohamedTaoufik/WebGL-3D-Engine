"use strict"

import { Renderer } from './core/renderer/Renderer.js'
import { OrbitControls } from './utils/OrbitControls.js'
import { Loop } from './utils/Loop.js'
import { Spherical } from './math/Spherical.js'
import { PI, PI05, PI2 } from './math/MathUtils.js'
import { MainDebugView } from './debug/MainDebugView.js'
import { Node } from './core/models/Node.js'
import { GLBLoader } from './loader/GLBLoader.js'
import { Point } from './core/models/Point.js'
import { pointMaterial } from './examples/materials/pointMaterial.js'
import { Texture } from './core/renderer/textures/Texture.js'


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

const POINT_LIGHT_TEST_COUNT = 20
const pointLightsInit = (/**@type {Renderer}*/ renderer) => {
    const lights = renderer.lights

    const updates = []
    for (let i = 0; i < POINT_LIGHT_TEST_COUNT; i++) {
        const object = new Node(renderer, { pointCount: 1 })

        const img = new Image()
        img.onload = () => {
            const tex = new Texture(renderer, img)
            object.mesh.bindTexture('texture1', tex.texture)
        }
        img.src = new URL('./spark.svg', import.meta.url).href

        const light = lights.getPointLight()
        const spherical = new Spherical(1.2, Math.random() * PI2, Math.random() * PI2)
        light.diffuse.set(Math.random(), Math.random(), Math.random())
        // light.diffuse.set(1,0,0)
        let age = 0
        updates.push((dt) => {

            // age += dt
            // light.position.y = 0.65 + Math.cos(age) / 5
            // light.position.x = 0
            spherical.phi += Math.sin(dt) * 0.1
            spherical.phi += Math.cos(dt) * 0.01
            light.position.setFromSpherical(spherical)
            light.position.y += 1
            light.position.toArray(object.worldMatrix.elements, 12)

            lights.needsUpdate = true
        })
    }
    const update = (dt) => {
        for (let i = 0; i < POINT_LIGHT_TEST_COUNT; i++) {
            updates[i](dt)
        }
        lights.needsUpdate = true
    }
    renderer.onBeforeRender.add(update)
}

const init = async () => {
    const renderer = new Renderer()
    document.body.appendChild(renderer.canvas)
    renderer.canvas.width = '100%'
    renderer.canvas.height = '100%'

    new OrbitControls(renderer.camera, renderer.canvas, renderer.onBeforeRender)

    const gltf_loader = new GLBLoader()

    const gltf = await gltf_loader.load(new URL('./loader/blader.glb', import.meta.url))
    const node = new Node(renderer, gltf.nodes[12])

    // const gltf = await gltf_loader.load(new URL('./untitled.glb', import.meta.url))
    // const node = new Node(renderer, gltf.nodes[2])

    new Loop(renderer.draw)

    // directional_lights_init(renderer)
    await pointMaterial.init()
    pointLightsInit(renderer)

    new MainDebugView(renderer)
}

init()
