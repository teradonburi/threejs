/* global THREE: false */
import 'three/OrbitControls'

export default class Camera2D {

  constructor(width = window.innerWidth, height = window.innerHeight, near = 1, far = 10) {
    this.camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, near, far)
    this.camera.position.z = far
    this.camera.resize = this.resize
    return this.camera
  }

  resize = () => {
    // カメラのアスペクト比を正す
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

}
