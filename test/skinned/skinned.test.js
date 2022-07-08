"use strict"

import { Renderer } from '../../core/renderer/Renderer.js'
import { OrbitControls } from '../../utils/OrbitControls.js'
import { Loop } from '../../utils/Loop.js'
import { Spherical } from '../../math/Spherical.js'
import { PI2 } from '../../math/MathUtils.js'
import { MainDebugView } from '../../debug/MainDebugView.js'
import { Node } from '../../core/models/Node.js'
import { GLBLoader } from '../../loader/GLBLoader.js'
import { pointMaterial } from '../../examples/materials/pointMaterial.js'
import { PointTest } from '../../examples/objects/Point.js'
import { CursorView } from '../../debug/CursorView.js'
import { SkinView } from '../../debug/SkinView.js'

const POINT_LIGHT_TEST_COUNT = 20
const pointLightsInit = (/**@type {Renderer}*/ renderer) => {
    const lights = renderer.lights

    const updates = []
    for (let i = 0; i < POINT_LIGHT_TEST_COUNT; i++) {
        const object = new PointTest(renderer)
        object.texture.data.src = new URL('./spark.svg', import.meta.url).href
        const light = lights.getPointLight()
        const spherical = new Spherical(1.2, Math.random() * PI2, Math.random() * PI2)
        light.diffuse.set(Math.random(), Math.random(), Math.random())
        // light.diffuse.set(1,0,0)
        let age = 0
        updates.push((dt) => {

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

export const skinnedTest = async () => {
    const renderer = new Renderer()
    document.body.appendChild(renderer.canvas)
    renderer.canvas.width = '100%'
    renderer.canvas.height = '100%'

    new OrbitControls(renderer.camera, renderer.canvas, renderer.onBeforeRender)

    const gltf_loader = new GLBLoader()

    const gltf = await gltf_loader.load(new URL('./blader.glb', import.meta.url))
    const gltfNode = gltf.nodes.find(a => a.name === 'blader')
    const node = new Node(renderer, gltfNode)

    new Loop(renderer.draw)

    await pointMaterial.init()
    pointLightsInit(renderer)

    node.animations.play('blader_jump')

    // debug view
    const debugContainer = new MainDebugView(renderer).container
    new CursorView(debugContainer,
        'animation time', (t) => {
            node.animations.setT(t)
            node.skin.update()
        }, 0, 1, 0.01)
    new SkinView(debugContainer, node.skin, renderer.onBeforeRender)
}
