/* global THREE: false */
import 'three/Water'

export default class Water {
  constructor (directinalLight, waterColor = 0x001e0f, sunColor = 0xffffff, fog = false, size = 10000, textureSize = 512) {
    const waterGeometry = new THREE.PlaneBufferGeometry(size, size)
    this.water = new THREE.Water(
      waterGeometry,
      {
        textureWidth: textureSize,
        textureHeight: textureSize,
        waterNormals: new THREE.TextureLoader().load('./textures/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        }),
        sunDirection: directinalLight ? directinalLight.position.clone().normalize() : undefined,
        sunColor,
        waterColor,
        distortionScale: 3.7,
        size: 0.1,
        alpha: 1.0,
        fog,
      })
    this.water.rotation.x = -Math.PI / 2
    this.water.setEnv = this.setEnv.bind(this)
    this.water.setLight = this.setLight.bind(this)
    this.water.update = this.update.bind(this)
    return this.water
  }

  setEnv = ({distortionScale, size, alpha}) => {
    const uniforms = this.water.material.uniforms
    if (distortionScale) uniforms.distortionScale.value = distortionScale
    if (size) uniforms.size.value = size
    if (alpha) uniforms.alpha.value = alpha
  }

  setLight = (light) => {
    this.water.material.uniforms.sunDirection.value.copy(light.position).normalize()
  }

  update = (delta = 1.0 / 60.0) => {
    this.water.material.uniforms.time.value += delta
  }

}