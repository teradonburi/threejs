/* global THREE: false */
import 'three/DragControls'

export default class DragControls {
  constructor (draggableObjects, camera, renderer, onDragStart, onDragEnd) {
    const dragControls = new THREE.DragControls(draggableObjects, camera, renderer.domElement)
    dragControls.addEventListener('dragstart', onDragStart)
    dragControls.addEventListener('dragend', onDragEnd)
  }
}