/* global THREE: false */
import 'three/Water'

export default class Water {
  constructor (directinalLight, fog = false, size = 10000, textureSize = 512) {
    const waterGeometry = new THREE.PlaneBufferGeometry(size, size)
    this.water = new THREE.Water(
      waterGeometry,
      {
        textureWidth: textureSize,
        textureHeight: textureSize,
        waterNormals: new THREE.TextureLoader().load('./textures/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        }),
        alpha: 1.0,
        sunDirection: directinalLight ? directinalLight.position.clone().normalize() : undefined,
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        size: 0.1,
        fog,
      })
    this.water.rotation.x = -Math.PI / 2
    return this.water
  }

}