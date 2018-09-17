/* global THREE: false */
import 'three/OrbitControls'

export default class Camera {
  constructor (eye, lookAt, near = 1, far = 20000, fov = 45, aspect = window.innerWidth / window.innerHeight) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.camera.position.set(eye.x, eye.y, eye.z)
    this.camera.lookAt(lookAt)
    this.camera.helper = new THREE.CameraHelper(this.camera)
    this.camera.createControls = this.createControls.bind(this)
    this.camera.resize = this.resize.bind(this)
    return this.camera
  }

  createControls = () => {
    this.camera.controls = new THREE.OrbitControls(this.camera)
    return this.camera.controls
  }

  resize = () => {
    // カメラのアスペクト比を正す
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

}
