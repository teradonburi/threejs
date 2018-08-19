/* global THREE: false, Ammo: false */

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
    this.physicsWorld.updateDynamicObjectsModelPose = this.updateDynamicObjectsModelPose
    this.physicsWorld.addSphereBody = this.addSphereBody
    this.physicsWorld.addBoxBody = this.addBoxBody
    this.physicsWorld.addCylinderBody = this.addCylinderBody
    this.physicsWorld.addConeBody = this.addConeBody
    return this.physicsWorld
  }

  // 物理世界のシミュレーションを更新する（重力計算、衝突計算など）
  update = (deltaTime) => {
    this.physicsWorld.stepSimulation(deltaTime, 10)
  }

  updateDynamicObjectsModelPose = () => {
    for (let i = 0; i < this.physicsWorld.dynamicObjects.length; i++) {
      const objThree = this.physicsWorld.dynamicObjects[ i ]
      if (objThree.userData && objThree.userData.ignorePhysics) {
        continue
      }
      PhysicsWorld.updateModelPose(objThree)
    }
  }

  addSphereBody = (objThree, radius, mass) => {
    const shape = new Ammo.btSphereShape(radius)
    shape.setMargin(0.05)

    const transform = PhysicsWorld.createTransform(objThree.position, objThree.quaternion, objThree.scale)
    objThree.userData.physicsBody = PhysicsWorld.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addBoxBody = (objThree, size, mass) => {
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5))
    shape.setMargin(0.05)

    const transform = PhysicsWorld.createTransform(objThree.position, objThree.quaternion, objThree.scale)
    objThree.userData.physicsBody = PhysicsWorld.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addCylinderBody = (objThree, radius, height, mass) => {
    const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius))
    shape.setMargin(0.05)

    const transform = PhysicsWorld.createTransform(objThree.position, objThree.quaternion, objThree.scale)
    objThree.userData.physicsBody = PhysicsWorld.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addConeBody = (objThree, radius, height, mass) => {
    const shape = new Ammo.btConeShape(radius, height)
    shape.setMargin(0.05)

    const transform = PhysicsWorld.createTransform(objThree.position, objThree.quaternion, objThree.scale)
    objThree.userData.physicsBody = PhysicsWorld.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  // 物理世界の姿勢作成
  static createTransform(pos = new THREE.Vector3(0, 0, 0), q = new THREE.Quaternion(0, 0, 0, 1), scale = new THREE.Vector3(1, 1, 1)) {
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(pos.x * scale.x, pos.y * scale.y, pos.z * scale.z))
    transform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w))
    return transform
  }

  // 物理世界の衝突オブジェクトを作成
  static createBody(mass, transform, shape) {
    const localInertia = new Ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)
    const motionState = new Ammo.btDefaultMotionState(transform)
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)
    return body
  }

  // 物理世界の姿勢をモデルの描画姿勢に反映
  static updateModelPose(objThree) {
    const ms = objThree.userData.physicsBody && objThree.userData.physicsBody.getMotionState()
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
