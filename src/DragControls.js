/* global THREE: false, Ammo: false */
import 'three/DragControls'

export default class DragControls {
  constructor (draggableObjects, camera, renderer) {
    const dragControls = new THREE.DragControls(draggableObjects, camera, renderer.domElement)
    dragControls.addEventListener('dragstart', (e) => {
      if (camera.controls) {
        camera.controls.enabled = false
      }
      if (e.object.userData) {
        e.object.userData.ignorePhysics = true
      }
    })
    dragControls.addEventListener('dragend', (e) => {

      if (e.object.userData && e.object.userData.physicsBody) {
        const objPhys = e.object.userData.physicsBody
        const transform = new Ammo.btTransform()
        transform.setIdentity()
        const pos = e.object.position
        const q = e.object.quaternion
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
        transform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w))
        const motionState = new Ammo.btDefaultMotionState(transform)
        objPhys.forceActivationState(1) // ACTIVE_TAG
        objPhys.activate()
        objPhys.setMotionState(motionState)
        e.object.userData.ignorePhysics = false
      }
      if (camera.controls) {
        camera.controls.enabled = true
      }
    })
  }
}