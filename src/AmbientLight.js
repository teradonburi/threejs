
/* global THREE: false */

export default class AmbientLight {
  constructor(color = 0x555555) {
    this.ambient = new THREE.AmbientLight(color, 1)
    return this.ambient
  }
}