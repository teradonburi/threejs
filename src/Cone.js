/* global THREE: false, Ammo: false */

export default class Cone {
  constructor (initPos = new THREE.Vector3(0, 0, 0), objectSize = 3, color = Math.floor(Math.random() * (1 << 24))) {
    const radius = 1 + Math.random() * objectSize
    const height = 2 + Math.random() * objectSize
    this.mesh = new THREE.Mesh(new THREE.ConeBufferGeometry(radius, height, 20, 2), new THREE.MeshPhongMaterial({ color }))
    this.mesh.position.set(initPos.x, initPos.y, initPos.z)

    this.mesh.userData.physicsBody = this.createPhysicsBody(radius, height, objectSize)
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    return this.mesh
  }

  createPhysicsBody = (radius, height, objectSize) => {
    const shape = new Ammo.btConeShape(radius, height)
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