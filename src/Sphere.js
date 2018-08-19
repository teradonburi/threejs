/* global THREE: false */

export default class Sphere {
  constructor (radius, color = Math.floor(Math.random() * (1 << 24))) {
    this.mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({ color }))
    this.mesh.radius = radius
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    return this.mesh
  }
}