# WebGL 3D Engine

This is a attempt to get an alternative from Three JS. This 3D Engine can be more performante than Three JS but needs some knowledge in WebGL and a good understanding of the memory management.

## Scene Graph Not Standard

The way the scene graph is organised is not standard.

We have the `Renderer` that draw all `Program` which draw all `Object3D_Abstract`.

`Attribute` is an interface to represente an attribute in `Material` that `Object3D_Abstract` should set for itself.

`Material` is an interface to store shaders, uniforms data and attributes to compile gl.program in `Program`.

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
