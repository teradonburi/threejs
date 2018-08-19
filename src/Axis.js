/* global THREE: false */

export default class Axis {
  constructor (length = 300) {
    this.axis = new THREE.AxesHelper(length)
    return this.axis
  }
}
