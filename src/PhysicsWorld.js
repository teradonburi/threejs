/* global Ammo: false */

export default class PhysicsWorld {
  constructor (gravity = new Ammo.btVector3(0, -6, 0)) {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    const broadphase = new Ammo.btDbvtBroadphase()
    const solver = new Ammo.btSequentialImpulseConstraintSolver()
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
    this.physicsWorld.setGravity(gravity)
    this.physicsWorld.dynamicObjects = []
    this.physicsWorld.update = this.update
    return this.physicsWorld
  }

  update = (deltaTime) => {
    this.physicsWorld.stepSimulation(deltaTime, 10)
		// Update objects
    for (let i = 0; i < this.physicsWorld.dynamicObjects.length; i++) {
      const objThree = this.physicsWorld.dynamicObjects[ i ]
      if (objThree.userData && objThree.userData.ignorePhysics) {
        continue
      }
      const ms = objThree.userData.physicsBody.getMotionState()
      if (ms) {
        let transformAux1 = new Ammo.btTransform()
        ms.getWorldTransform(transformAux1)
        const p = transformAux1.getOrigin()
        const q = transformAux1.getRotation()
        objThree.position.set(p.x(), p.y(), p.z())
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w())
      }
    }
  }

}
