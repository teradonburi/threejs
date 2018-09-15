/* global THREE: false */
import 'three/Sky'

export default class Sky {
  constructor (scale = 10000) {
    this.sky = new THREE.Sky()
    this.sky.scale.setScalar(scale)
    const uniforms = this.sky.material.uniforms
    uniforms.turbidity.value = 10
    uniforms.rayleigh.value = 2
    uniforms.luminance.value = 1
    uniforms.mieCoefficient.value = 0.005
    uniforms.mieDirectionalG.value = 0.8
    return this.sky
  }
}