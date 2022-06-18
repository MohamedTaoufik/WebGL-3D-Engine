"use strict"

import { Renderer } from './core/Renderer.js'
import { Program } from './core/Program.js'
import { F } from './examples/objects/F.js'
import { OrbitControls } from './utils/OrbitControls.js'
import { Cursor_View } from './debug/Cursor_View.js'
import { test_mat } from './examples/materials/test.js'
import { Loop } from './utils/Loop.js'

const renderer = new Renderer()
document.body.appendChild(renderer.canvas)
renderer.canvas.width = '100%'
renderer.canvas.height = '100%'
const cam = renderer.camera
new OrbitControls(renderer.camera, renderer.canvas, renderer.on_before_render)

// const container = document.createElement('div')
// container.style.position = 'fixed'
// container.style.top = '0'
// container.style.left = '0'
// document.body.appendChild(container)
// const cursor_x = new Cursor_View('pos X', (value) => { cam.position.x = value })
// const cursor_y = new Cursor_View('pos Y', (value) => { cam.position.y = value })
// const cursor_z = new Cursor_View('pos Z', (value) => { cam.position.z = value })
// container.append(cursor_x.container, cursor_y.container, cursor_z.container)

const program = new Program(renderer, test_mat)

new F(program)

new Loop(renderer.draw)

addEventListener('contextmenu', (e) => { e.stopPropagation(); e.preventDefault() })