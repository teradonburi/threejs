/* global THREE: false */

export default class RayCaster {
  constructor () {
    this.raycaster = new THREE.Raycaster()
    this.raycaster.getIntersect = this.getIntersect.bind(this)
    return this.raycaster
  }

  getIntersect = (mouse, camera, mesh) => {
    this.raycaster.setFromCamera(mouse, camera)
    const intersects = this.raycaster.intersectObject(mesh)
    return intersects
  }
}