/* global THREE: false */
import 'three/Sky'

export default class Sky {
  constructor (scale = 10000) {
    this.sky = new THREE.Sky()
    this.sky.scale.setScalar(scale)
    const uniforms = this.sky.material.uniforms
    uniforms.turbidity.value = 10 // 混濁
    uniforms.rayleigh.value = 2 // レイリー散乱
    uniforms.luminance.value = 1 // 明るさ
    uniforms.mieCoefficient.value = 0.005 // ミー係数
    uniforms.mieDirectionalG.value = 0.8 // ミー指向性グラディエント
    this.sky.setEnv = this.setEnv.bind(this)
    this.sky.setLight = this.setLight.bind(this)
    return this.sky
  }

  setEnv = ({turbidity, rayleigh, luminance, mieCoefficient, mieDirectionalG}) => {
    const uniforms = this.sky.material.uniforms
    if (turbidity) uniforms.turbidity.value = turbidity
    if (rayleigh) uniforms.rayleigh.value = rayleigh
    if (luminance) uniforms.luminance.value = luminance
    if (mieCoefficient) uniforms.mieCoefficient.value = mieCoefficient
    if (mieDirectionalG) uniforms.mieDirectionalG.value = mieDirectionalG
  }

  setLight = (light) => {
    this.sky.material.uniforms.sunPosition.value.copy(light.position)
  }
}