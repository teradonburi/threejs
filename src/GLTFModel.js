/* global THREE: false */

export default class GLTFModel {
  constructor (gltf) {
    this.object = gltf.scene
    const animations = gltf.animations
    if (animations && animations.length) {
      this.object.mixer = new THREE.AnimationMixer(this.object)
      this.object.actions = []
      for (let i = 0; i < animations.length; i ++) {
        const animation = animations[ i ]
        this.object.actions.push(this.object.mixer.clipAction(animation))
      }
    }
  }
}