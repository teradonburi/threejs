/* global THREE: false */
import 'three/GLTFLoader'
import 'three/Draco'

export default class Loader {
  constructor () {
    this.texLoader = new THREE.TextureLoader()
    this.jsonLoader = new THREE.JSONLoader()
    this.glTFLoader = new THREE.GLTFLoader()
    this.glTFLoader.setCrossOrigin('anonymous')
    THREE.DRACOLoader.setDecoderPath('node_modules/three/examples/js/libs/draco/gltf/')
    this.glTFLoader.setDRACOLoader(new THREE.DRACOLoader())
  }

  loadTexture = (filename) => {
    return new Promise((resolve) => {
      this.texLoader.load(filename, texture => resolve(texture))
    })
  }

  loadJsonModel = (filename) => {
    return new Promise((resolve) => {
      this.jsonLoader.load(filename, geometry => resolve(geometry))
    })
  }
  loadGLTFModel = (filename) => {
    return new Promise((resolve) => {
      this.glTFLoader.load(filename, data => resolve(data))
    })
  }
}
