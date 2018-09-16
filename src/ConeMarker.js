/* global THREE: false */

export default class ConeMarker {
  constructor (radius, height, radiusSegments = 3) {
    this.mesh = new THREE.Mesh(new THREE.ConeBufferGeometry(radius, height, radiusSegments), new THREE.MeshNormalMaterial())
    return this.mesh
  }
}