/* global THREE: false */

export default class PositionalAudio {
  constructor(buffer, listener) {
    this.audio = new THREE.PositionalAudio(listener)
    this.audio.setBuffer(buffer)
    return this.audio
  }
}