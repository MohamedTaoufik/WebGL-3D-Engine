# WebGL 3D Engine

This is an attempt to get an alternative from Three JS. This 3D Engine can be more performant than Three JS but needs some knowledge in WebGL and a good understanding of the memory management and uniforms/attributes update.

## Knowledges

One free way (and what I have done) to get knowledges is:

- study Three JS on a simple personal project with
+ the tutorial: https://threejs.org/manual/
+ the documentation: https://threejs.org/docs/

- use the class ShaderMaterial from Three JS on few objects to get knowledges on GLSL language and WebGL mechanics.

Feel free to get into the Three JS source code, you can learn a lot of JavaScript techniques in addition of 3D Engine stuffs.
Be aware parts of this code can be outdated from modern JavaScript.

## How to use

- run localhost on index.html

`main.js`:

```js
"use strict"

import { Renderer } from './core/Renderer.js'
import { Program } from './core/Program.js'
import { F } from './examples/objects/F.js'
import { OrbitControls } from './utils/OrbitControls.js'
import { test_mat } from './examples/materials/test.js'
import { Loop } from './utils/Loop.js'

const renderer = new Renderer()
document.body.appendChild(renderer.canvas)
renderer.canvas.width = '100%'
renderer.canvas.height = '100%'
const cam = renderer.camera
new OrbitControls(renderer.camera, renderer.canvas, renderer.on_before_render)

const program = new Program(renderer, test_mat)

const my_wonderful_F_letter = new F(program)

new Loop(renderer.draw)
```

## How it works

The way the scene graph is organised is not standard.

We have the `Renderer` that draw all `Program` which draw all `Object3D_Abstract`.

`Attribute` is an interface to represent an attribute in `Material` that `Object3D_Abstract` should set for itself.

`Material` is an interface to store shaders code, uniform data and attribute data to compile gl.program in `Program`.

`Program` have a function `getAttributes` to get vao (use `extends Object3D_Abstract` on your objects to handle that) and a function `attributes_update` to update attribute after the TypedArray is changed.

`Program` have a property `uniform_setters` to change the uniform at draw call, ex:
```js
this.draw = () => {
    uniform_setters.worldMatrix(this.worldMatrix)
}
```

There is only one `Camera`, available in `Renderer`. In `Material`, vertex shader should have:
```glsl

...

uniform mat4 projectionViewMatrix;
uniform mat4 worldCameraMatrix;

...

void main() {
    ...
    
    gl_Position = projectionViewMatrix * worldMatrix * vec4(a_position, 1);

}

```

## Help Me

I'm looking for a job.

- https://www.twitch.tv/pyompy  
- https://tipeee.com/pyompy  
- https://twitter.com/nicolas_gayet 

