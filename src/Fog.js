/* global THREE: false */

export default class Fog {
  constructor (distance = 0.001, color = 0xefd1b5) {
    this.fog = new THREE.FogExp2(color, distance)
    return this.fog
  }
}