/* global THREE: false */

export default class Box {
  constructor (size = new THREE.Vector3(1, 1, 1), color = Math.floor(Math.random() * (1 << 24))) {
    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(size.x, size.y, size.z), new THREE.MeshPhongMaterial({ color }))
    this.mesh.size = size
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    return this.mesh
  }
}