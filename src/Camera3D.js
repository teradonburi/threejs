/* global THREE: false */
import 'three/OrbitControls'

export default class Camera {
  constructor (eye, lookAt, near = 1, far = 200, fov = 45, aspect = window.innerWidth / window.innerHeight) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.camera.position.set(eye.x, eye.y, eye.z)
    this.camera.lookAt(lookAt)
    this.camera.getHelper = this.getHelper
    this.camera.getControls = this.getControls
    this.camera.resize = this.resize
    return this.camera
  }

  getHelper = () => {
    this.helper = new THREE.CameraHelper(this.camera)
    return this.helper
  }

  getControls = () => {
    this.controls = new THREE.OrbitControls(this.camera)
    return this.controls
  }

  resize = () => {
    // カメラのアスペクト比を正す
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

}
