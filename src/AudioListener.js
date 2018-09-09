/* global THREE: false */

export default class AudioListener {
  constructor () {
    this.listener = new THREE.AudioListener()
    return this.listener
  }
}
