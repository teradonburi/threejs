/* global THREE: false */

export default class Cone {
  constructor (radius, height, radiusSegments = 20, heightSegments = 1, color = Math.floor(Math.random() * (1 << 24))) {
    this.mesh = new THREE.Mesh(new THREE.ConeBufferGeometry(radius, height, radiusSegments, heightSegments), new THREE.MeshPhongMaterial({ color }))
    this.mesh.radius = radius
    this.mesh.height = height
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    return this.mesh
  }
}