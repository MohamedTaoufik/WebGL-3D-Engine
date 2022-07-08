import { Renderer } from '../../core/renderer/Renderer.js'
import { MainDebugView } from '../../debug/MainDebugView.js'
import { PointTest } from '../../examples/objects/Point.js'
import { Loop } from '../../utils/Loop.js'
import { OrbitControls } from '../../utils/OrbitControls.js'

export const textureTest = () => {
    const renderer = new Renderer()
    document.body.appendChild(renderer.canvas)
    renderer.canvas.width = '100%'
    renderer.canvas.height = '100%'

    new OrbitControls(renderer.camera, renderer.canvas, renderer.onBeforeRender)

    const loop = new Loop(renderer.draw)

    const debugContainer = new MainDebugView(renderer).container
    const info = document.createElement('span')
    info.textContent = 'Use "i" "o" "p" to change textures.'
    debugContainer.appendChild(info)

    const point1 = new PointTest(renderer)
    const point2 = new PointTest(renderer)
    const point3 = new PointTest(renderer)

    let texPoint1 = 1
    let texPoint2 = 1
    let texPoint3 = 1

    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'o':
                if (texPoint1 === 1) texPoint1 = 2
                else texPoint1 = 1
                point1.texture.data.src = new URL(`./texture${texPoint1}.svg`, import.meta.url).href
                break
            case 'p':
                if (texPoint2 === 1) texPoint2 = 3
                else texPoint2 = 1
                point2.texture.data.src = new URL(`./texture${texPoint2}.svg`, import.meta.url).href
                break
            case 'i':
                if (texPoint3 === 1) texPoint3 = 4
                else texPoint3 = 1
                point3.texture.data.src = new URL(`./texture${texPoint3}.svg`, import.meta.url).href
                break
        }
    })

}