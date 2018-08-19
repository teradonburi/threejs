/* global THREE: false, Ammo: false */

export default class Sphere {
  constructor (initPos = new THREE.Vector3(0, 0, 0), objectSize = 3, color = Math.floor(Math.random() * (1 << 24))) {
    const radius = 1 + Math.random() * objectSize
    this.mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({ color }))
    this.mesh.position.set(initPos.x, initPos.y, initPos.z)

    this.mesh.userData.physicsBody = this.createPhysicsBody(radius, objectSize)
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    return this.mesh
  }

  createPhysicsBody = (radius, objectSize) => {
    const shape = new Ammo.btSphereShape(radius)
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