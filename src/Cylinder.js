
/* global THREE: false */

export default class Cylinder {
  constructor (radius, height, color = Math.floor(Math.random() * (1 << 24))) {
    this.mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 20, 1), new THREE.MeshPhongMaterial({ color }))
    this.mesh.radius = radius
    this.mesh.height = height
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    return this.mesh
  }
}
