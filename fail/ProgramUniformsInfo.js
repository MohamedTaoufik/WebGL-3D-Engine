
class uniformsInfo {
    constructor(name, location, type) {
        this.name = name
        this.location = location
        this.type = type
    }
}

const uniformsInfos = {}

const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
for (let i = 0; i < numUniforms; ++i) {
    const uniformInfo = gl.getActiveUniform(this.program, i)
    const name = uniformInfo.name
    if (
        name === 'u_cameraPosition'
        || name === 'u_projectionViewMatrix'
        || name === 'u_viewMatrix'
        || name.slice(0, 11) === 'pointLights'
        || name.slice(0, 9) === 'dirLights'
        || name.slice(0, 3) === "gl_" || name.slice(0, 6) === "webgl_" // ?
    ) continue

    uniformsInfos[name] = new uniformsInfo(name, i, uniformInfo.type)
}

console.log(uniformsInfos)