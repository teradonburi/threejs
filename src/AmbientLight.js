
/* global THREE: false */

export default class AmbientLight {
  constructor(color = 0x111111) {
    this.ambient = new THREE.AmbientLight(color, 1)
    return this.ambient
  }
}