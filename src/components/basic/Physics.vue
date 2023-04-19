<template>
  <canvas ref="webgl" class="webgl"></canvas>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { Mesh, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { onMounted, onUnmounted, ref } from 'vue'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import * as dat from 'dat.gui'
import pxTexture from './assets/textures/environmentMaps/0/px.jpg'
import nxTexture from './assets/textures/environmentMaps/0/nx.jpg'
import pyTexture from './assets/textures/environmentMaps/0/py.jpg'
import nyTexture from './assets/textures/environmentMaps/0/ny.jpg'
import pzTexture from './assets/textures/environmentMaps/0/pz.jpg'
import nzTexture from './assets/textures/environmentMaps/0/nz.jpg'
import CollisionSound from './assets/sounds/hit.mp3'

const webgl = ref()
const randomPlanePosition = () => Math.floor(Math.random() * 15 - 8)

const debugUISphere = {
  createOneSphere: () => {
    createSphere(Math.random() * 0.5, { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })
  },
  createOneBox: () => {
    createBox(Math.random(), Math.random(), Math.random(), { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })
  },
  createBatchSphere: () => {
    const length = Math.floor(Math.random() * 100) + 1
    for (let i = 0; i < length; i++) {
      const radius = Math.random() * 0.8
      createSphere(radius, { x: randomPlanePosition(), y: 3, z: randomPlanePosition() })
    }
  },
  reset: () => {
    // 清空所有
    for (const item of objectToUpdate) {
      item.body.removeEventListener('collied', playSound)
      world.removeBody(item.body)

      scene.remove(item.mesh)
    }
  },
  CannonDebugger: false
}

const gui = new dat.GUI()

/**
 * debug ui
 */
gui.add(debugUISphere, 'createOneSphere')
gui.add(debugUISphere, 'createBatchSphere')
gui.add(debugUISphere, 'createOneBox')
gui.add(debugUISphere, 'reset')

const sound = new Audio(CollisionSound)
const playSound = (collision: any) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal()
  if (impactStrength > 1.5) {
    sound.currentTime = 0
    sound.play()
  }
}

// 创建场景
const scene = new THREE.Scene()
// 设置场景大小
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

// 透视相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 0
camera.position.y = 5
camera.position.z = 20

scene.add(camera)

/**
 * light
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight)

const directionalHelp = new THREE.DirectionalLightHelper(directionalLight, 1)
scene.add(directionalHelp)


const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);


/**
 * world
 */
const world = new CANNON.World()
// 性能优化
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.82, 0)
// 混凝土的材料
const concreteMaterial = new CANNON.Material('concrete')
// 塑料
const plasticMaterial = new CANNON.Material('plastic')

const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1, // 摩擦
    restitution: 0.7 // 反弹
  }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial


/**
 * debugger
 */
const cannonMeshes: THREE.Mesh[] = []
const cannonDebugger = CannonDebugger(scene, world, {
  onInit(body, mesh) {
    mesh.visible = false
    cannonMeshes.push(mesh)
  },
})
gui.add(debugUISphere, 'CannonDebugger').name('CannonDebugger mesh visible').onChange((value: boolean) => {
  if (value) {
    cannonMeshes.forEach((item) => {
      item.visible = true
    })
  } else {
    cannonMeshes.forEach((item) => {
      item.visible = false
    })
  }
})

const sphereShape = new CANNON.Sphere(0.5)
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: sphereShape,
  // material: plasticMaterial
})
// // 添加推力
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
world.addBody(sphereBody)

// Floor
// const floorShape = new CANNON.Plane()
const floorShape = new CANNON.Box(new CANNON.Vec3(10 * 0.5, 0.2 * 0.5, 10 * 0.5))
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
  // quaternion: new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5),
  position: new CANNON.Vec3(0, -0.1, 0),
  // material: concreteMaterial
  material: new CANNON.Material({
    friction: 0.1, // 摩擦
    restitution: 0.7 // 反弹
  })
})
// floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
console.log(floorBody)
world.addBody(floorBody)

/**
 * plane
 */
// const plane = new THREE.PlaneBufferGeometry(15, 15)
// const planeMesh = new THREE.Mesh(plane, new THREE.MeshStandardMaterial({ color: '#777', metalness: 0.3, roughness: 0.4 }))
// planeMesh.rotation.x = -Math.PI / 2
// planeMesh.position.y = 0
// // 接受投影  
// planeMesh.receiveShadow = true
// scene.add(planeMesh)

const box = new THREE.BoxBufferGeometry(10, 10, 0.2)
const boxMesh = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: '#777', metalness: 0.3, roughness: 0.4 }))
boxMesh.rotation.x = -Math.PI / 2
boxMesh.position.set(0, -0.1, 0)
// 接受投影  
boxMesh.receiveShadow = true
scene.add(boxMesh)

/**
 * sphere
 */
const sphereTextureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const cubeTexture = cubeTextureLoader.load([
  pxTexture,
  nxTexture,
  pyTexture,
  nyTexture,
  pzTexture,
  nzTexture,
])

/**
 * createSphere
 */
const objectToUpdate: {
  mesh: Mesh,
  body: CANNON.Body
}[] = []
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const sphereTMaterial = new THREE.MeshStandardMaterial({
  envMap: cubeTexture,
  metalness: 0.3,
  roughness: 0.4
})
const createSphere = (radius: any, position: any) => {
  // create mesh
  const mesh = new THREE.Mesh(
    sphereGeometry,
    sphereTMaterial
  )
  mesh.scale.set(radius, radius, radius)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  // cannon.js body
  const shape = new CANNON.Sphere(0.5)
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial
  })
  body.position.copy(position)
  world.addBody(body)

  objectToUpdate.push({
    mesh,
    body
  })
}

/**
 * createBox
 */
const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
  envMap: cubeTexture,
  metalness: 0.3,
  roughness: 0.4
})
const createBox = (width: any, height: any, depth: any, position: any) => {
  // create mesh
  const mesh = new THREE.Mesh(
    boxGeometry,
    boxMaterial
  )
  mesh.scale.set(width, height, depth)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  // cannon.js body
  const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial
  })
  body.position.copy(position)
  body.addEventListener('collide', playSound)
  world.addBody(body)

  objectToUpdate.push({
    mesh,
    body
  })
}

let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  // 设置轨道控制器
  orbitControls = new OrbitControls(camera, renderer.domElement)
  // 惯性开关
  orbitControls.enableDamping = true
  // 阴影必须打开 渲染器shadowMap  
  renderer.shadowMap.enabled = true
  // 阴影类型
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap
  // 设置渲染大小
  renderer.setSize(sizes.width, sizes.height)
  // 设置分辨率
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // render
  render()

}
let count = 1
const Clock = new THREE.Clock()
let oldElapsedTime = 0
const render = () => {

  const elapsedTime = Clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime
  // 添加反推力 模拟风
  // test 
  // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)
  // update physics world
  // 更新cannon.js物理引擎世界
  world.step(1 / 60, deltaTime, 3)
  // test
  // sphereMesh.position.copy(sphereBody.position)

  // update Cannon
  // 将cannon.js物理引擎世界的物体位置同步到three.js场景中
  for (const item of objectToUpdate) {
    // 非ts 模式下 使用这种最好
    // item.mesh.position.copy(item.body.position)
    // item.mesh.quaternion.copy(item.body.quaternion)

    // const cannonPosition = item.body.position
    // item.mesh.position.copy(new THREE.Vector3(cannonPosition.x, cannonPosition.y, cannonPosition.z))

    // ts的模式下 建议使用set 使用拷贝会导致图片变形
    item.mesh.position.set(item.body.position.x, item.body.position.y, item.body.position.z)
    item.mesh.quaternion.set(item.body.quaternion.x, item.body.quaternion.y, item.body.quaternion.z, item.body.quaternion.w)

    // 判断物体是否超出边界平面，如果超出则重置物体位置和速度
    if (Math.abs(item.body.position.z) > 9 || Math.abs(item.body.position.x) > 9) {
      if (count++ === 1) {
        console.log(item.mesh)
        console.log(item.body)
      }
      // item.body.mass = 1
      // item.body.position.set(item.body.position.x, item.body.position.y, item.body.position.z);
      // item.body.velocity.set(Math.random() * 2 - 1,  Math.random() * 5 + 5, Math.random() * 2 - 1);
      // 将小球的质量设为0，变成一个静态物体
      // item.body.mass = 0;

      // 将小球的弹性设为0，不进行碰撞反弹
      // item.body.material.restitution = 0
      // 将小球的阻力设为0，保证自由下落
      // item.body.linearDamping = 0;
      // item.body.angularDamping = 0;
      // 设置小球的初始速度，让其自由下落
      // item.body.velocity.set(0, 0, 0);
      // world.removeBody(item.body);
      // item.mesh.position.copy(item.body.position);

      // item.body.mass = 0
      // item.body.velocity.set(0, -10, 0);
      // item.body.angularVelocity.set(0, 0, 0);

      // world.removeBody(item.body);
      // scene.remove(item.mesh);
      // const newBallShape = new CANNON.Sphere(1.5);
      // const newBallBody = new CANNON.Body({
      //   mass: 1,
      //   position: new CANNON.Vec3(0, item.body.position.y, 0),
      //   shape: newBallShape,
      // });
      // world.addBody(newBallBody);
      // item.body = newBallBody;
      // const mesh = new THREE.Mesh(
      //   boxGeometry,
      //   boxMaterial
      // )
      // // mesh.scale.set(item.mesh.position.x, item.mesh.position.y, item.mesh.position.z)
      // mesh.castShadow = true
      // scene.add(item.mesh);
    }

    // if (!boundingBox.containsPoint(item.body.position)) {
    //   // 物体超出边界框，让它自由下落
    //   item.body.velocity.set(0, -10, 0);
    // }

    // 在物理模拟循环中检查物体是否超出场景范围
    // world.addEventListener('postStep', () => {
    //   if (Math.abs(item.body.position.x) > 7 || Math.abs(item.body.position.z) > 7) {
    //     // 超出场景范围，将物体设置为自由下落状态
    //     item.body.mass = 0;

    //     // 重置物体的位置和旋转
    //     item.body.position.set(item.mesh.position.x, item.mesh.position.y, item.mesh.position.z);
    //     item.body.quaternion.set(item.mesh.quaternion.x, item.mesh.quaternion.y, item.mesh.quaternion.z, item.mesh.quaternion.w);
    //   } else {
    //     // 未超出场景范围，将物体的质量设置为1，使其保持原有状态
    //     item.body.mass = 1;
    //   }
    // });
  }
  cannonDebugger.update() // Update the CannonDebugger meshes
  // 更新轨道控制器
  orbitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth - 240
  sizes.height = window.innerHeight - 100

  // 更新相机
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

onMounted(() => {
  renderInit()
  createSphere(0.5, { x: 0, y: 3, z: 0 })
  console.log(objectToUpdate)
})

onUnmounted(() => {
  gui.destroy()
})

</script>

<style lang="less" scoped></style>
