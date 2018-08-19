/* global THREE: false */

export default class Grid {
  constructor (size = 200, slice = 5) {
    this.grid = new THREE.GridHelper(size, slice)
    return this.grid
  }
}