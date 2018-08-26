/* global THREE: false */

export default class Vec3 {
  constructor(x, y, z) {
    this.vec3 = new THREE.Vector3(x, y, z)
    return this.vec3
  }
}
