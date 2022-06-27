import { Euler } from '../math/Euler.js'
import { Quaternion } from '../math/Quaternion.js'
import { Vector3 } from '../math/Vector3.js'
import { CanvasRecorder } from '../utils/CanvasRecorder.js'
import { FPS_View } from './FPS_View.js'







export class MainDebugView {
    constructor(
        renderer,
        parent = document.body
    ) {

        const container = document.createElement('div')
        container.style.position = 'fixed'
        container.style.top = '0'
        container.style.left = '0'
        container.style.padding = '10px'
        parent.appendChild(container)
        // const cursor_x = new Cursor_View('cam pos X', (value) => { cam.position.x = value; cam.projectionViewMatrixNeedsUpdate = true; cam.lookAt(0, 0, 0) })
        // const cursor_y = new Cursor_View('cam pos Y', (value) => { cam.position.y = value; cam.projectionViewMatrixNeedsUpdate = true; cam.lookAt(0, 0, 0) })
        // const cursor_z = new Cursor_View('cam pos Z', (value) => { cam.position.z = value; cam.projectionViewMatrixNeedsUpdate = true; cam.lookAt(0, 0, 0) })
        // container.append(cursor_x.container, cursor_y.container, cursor_z.container)

        const cam_pos = new Vector3()
        const cam_quat = new Quaternion()
        const cam_euler = new Euler()
        const cam_scale = new Vector3()

        const cam = renderer.camera

        const decompose_cam = document.createElement('span')
        container.appendChild(decompose_cam)
        renderer.onBeforeRender.add(() => {
            cam.worldCameraMatrix.decompose(cam_pos, cam_quat, cam_scale)
            cam_euler.setFromQuaternion(cam_quat)
            decompose_cam.innerHTML = `
            cam pos: ${cam_pos.x.toFixed(1)}, ${cam_pos.y.toFixed(1)}, ${cam_pos.z.toFixed(1)}<br>
            cam euler: ${cam_euler.x.toFixed(1)}, ${cam_euler.y.toFixed(1)}, ${cam_euler.z.toFixed(1)}<br>
            `
        })

        const canvasRecorder = new CanvasRecorder(renderer.canvas)

        const button = document.createElement('button')
        button.innerHTML = 'Record'
        container.appendChild(button)
        button.addEventListener('click', () => {
            if (button.innerHTML === 'Record') {
                canvasRecorder.record()
                button.innerHTML = 'Download'
            } else {
                canvasRecorder.stop()
                button.innerHTML = 'Record'
            }
        })

        new FPS_View(container, renderer.onBeforeRender)
    }
}





