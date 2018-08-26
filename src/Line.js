/* global THREE: false */

export default class Line {
  constructor (start = new THREE.Vector3(0, 0, 0), end = new THREE.Vector3(0, 0, 1), color = Math.floor(Math.random() * (1 << 24))) {
    var geometry = new THREE.Geometry()
    geometry.vertices.push(start)
    geometry.vertices.push(end)
    this.line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }))
    return this.line
  }
}