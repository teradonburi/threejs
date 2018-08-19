/* global THREE: false */

export default class Clock {
  constructor() {
    this.clock = new THREE.Clock()
    this.time = 0
  }

  update = () => {
    const delta = this.clock.getDelta()
    this.time += delta
    return {delta, time: this.time}
  }
}