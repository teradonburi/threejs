/* global THREE: false */
import 'three/QuickHull'
import 'three/Convex'

export default class Cone {
  constructor (vertices, color = Math.floor(Math.random() * (1 << 24))) {
    this.mesh = new THREE.Mesh(new THREE.ConvexGeometry(vertices), new THREE.MeshBasicMaterial({color}))
    return this.mesh
  }
}