/* global THREE: false */

export default class Audio {
  constructor(buffer, listener) {
    this.audio = new THREE.Audio(listener)
    this.audio.setBuffer(buffer)
    return this.audio
  }
}
