import { GLBLoader } from '../../loader/GLBLoader.js'


export const glbLoaderTest = async (url = new URL('./blader.glb', import.meta.url)) => {
    const loader = new GLBLoader()
    const gltfData = await loader.load(url)
    console.log(gltfData)
}