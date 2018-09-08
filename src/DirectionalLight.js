/* global THREE: false */

export default class DirectionalLight {
  constructor(direction = new THREE.Vector3(100, 100, 50), dLight = 512, color = 0xffffff, shadowMapSize = 1024) {
    // lighting
    this.light = new THREE.DirectionalLight(color, 1)
    this.light.position.set(direction.x, direction.y, direction.z)
    this.light.castShadow = true
    const sLight = dLight * 0.25
    this.light.shadow.camera.left = -sLight
    this.light.shadow.camera.right = sLight
    this.light.shadow.camera.top = sLight
    this.light.shadow.camera.bottom = -sLight
    this.light.shadow.camera.near = dLight / 30
    this.light.shadow.camera.far = dLight
    this.light.shadow.mapSize.x = shadowMapSize * 2
    this.light.shadow.mapSize.y = shadowMapSize * 2
    return this.light
  }
}