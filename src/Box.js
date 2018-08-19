/* global THREE: false, Ammo: false */

export default class Box {
  constructor (initPos = new THREE.Vector3(0, 0, 0), objectSize = 3, color = Math.floor(Math.random() * (1 << 24))) {
    const sx = 1 + Math.random() * objectSize
    const sy = 1 + Math.random() * objectSize
    const sz = 1 + Math.random() * objectSize
    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), new THREE.MeshPhongMaterial({ color }))
    this.mesh.position.set(initPos.x, initPos.y, initPos.z)

    this.mesh.userData.physicsBody = this.createPhysicsBody(sx, sy, sz, objectSize)
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    return this.mesh
  }

  createPhysicsBody = (sx, sy, sz, objectSize) => {
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
    shape.setMargin(0.05)

    const mass = objectSize * 5
    const localInertia = new Ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    const pos = this.mesh.position
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    const motionState = new Ammo.btDefaultMotionState(transform)
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)
    return body
  }
}