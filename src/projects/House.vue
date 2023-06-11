<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Float32BufferAttribute, WebGLRenderer} from 'three'
import * as dat from 'dat.gui'

import doorColor from './assets/door/color.jpg'
import doorAlpha from './assets/door/alpha.jpg'
import doorHeight from './assets/door/height.jpg'
import doorMetalNess from './assets/door/metalness.jpg'
import doorNormal from './assets/door/normal.jpg'
import doorRoughness from './assets/door/roughness.jpg'
import doorAmbientOcclusion from './assets/door/ambientOcclusion.jpg'

import bricksColor from './assets/bricks/color.jpg'
import bricksNormal from './assets/bricks/normal.jpg'
import bricksAmbientOcclusion from './assets/bricks/ambientOcclusion.jpg'
import bricksRoughness from './assets/bricks/roughness.jpg'

import grassColor from './assets/grass/color.jpg'
import grassNormal from './assets/grass/normal.jpg'
import grassAmbientOcclusion from './assets/grass/ambientOcclusion.jpg'
import grassRoughness from './assets/grass/roughness.jpg'

const texture = new THREE.TextureLoader()
const doorColorTexture = texture.load(doorColor)
const doorAlphaTexture = texture.load(doorAlpha)
const doorHeightTexture = texture.load(doorHeight)
const doorMetalNessTexture = texture.load(doorMetalNess)
const doorNormalTexture = texture.load(doorNormal)
const doorRoughnessTexture = texture.load(doorRoughness)
const doorAmbientOcclusionTexture = texture.load(doorAmbientOcclusion)

const bricksColorTexture = texture.load(bricksColor)
const bricksNormalTexture = texture.load(bricksNormal)
const bricksAmbientOcclusionTexture = texture.load(bricksAmbientOcclusion)
const bricksRoughnessTexture = texture.load(bricksRoughness)

const grassColorTexture = texture.load(grassColor)
const grassNormalTexture = texture.load(grassNormal)
const grassAmbientOcclusionTexture = texture.load(grassAmbientOcclusion)
const grassRoughnessTexture = texture.load(grassRoughness)

grassColorTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassAmbientOcclusionTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

const webgl = ref()

const gui = new dat.GUI()

// 创建场景
const scene = new THREE.Scene()

// fog
const fog = new THREE.Fog('#262837', 1, 15)

scene.fog = fog

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

window.addEventListener('resize', () => {
  // 更新sizes大小
  sizes.width = window.innerWidth - 240
  sizes.height = window.innerHeight - 100

  // 更新相机 摄像机视锥体的长宽比
  camera.aspect = sizes.width / sizes.height
  // 更新相机矩阵
  camera.updateProjectionMatrix()

  // 更新渲染器
  renderer.setSize(sizes.width, sizes.height)
  // 更新分辨率
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('dblclick', () => {
  // 全屏
  const fullscreenElement = document.fullscreenElement
  if (!fullscreenElement) {
    if (renderer.domElement.requestFullscreen) {
      renderer.domElement.requestFullscreen()
    }
  } else {
    document.exitFullscreen()
  }
})

// 相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.x = 5
camera.position.y = 3
camera.position.z = 5
scene.add(camera)

// 环境灯  灯光颜色 灯光强度
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)

// 平行灯
const directionalLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
// 改变灯光位置
directionalLight.position.set(2, 2, -1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001)
scene.add(directionalLight)
directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024

directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
directionalLight.shadow.radius = 10

gui.add(directionalLight.shadow.camera, 'far').min(-5).max(5).step(0.1)
gui.add(directionalLight.shadow.camera, 'near').min(-5).max(5).step(0.1)

const house = new THREE.Group()
scene.add(house)

const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0, 2.2, 2.7)

doorLight.castShadow = true
// const doorLightHelper = new THREE.PointLightHelper(doorLight, 0.2)
house.add(doorLight)
// house.add(doorLightHelper)

// walls
const walls = new THREE.Mesh(
    new THREE.BoxBufferGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
      map: bricksColorTexture,
      normalMap: bricksNormalTexture,
      aoMap: bricksAmbientOcclusionTexture,
      roughnessMap: bricksRoughnessTexture
    })
)
walls.geometry.setAttribute('uv2', new Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))
walls.position.y = 2.5 / 2
house.add(walls)

// 房顶 roof
const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({color: '#b35f45'})
)
roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI * 0.25
house.add(roof)

// door 门
const door = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
      map: doorColorTexture,
      transparent: true,
      alphaMap: doorAlphaTexture,
      aoMap: doorAmbientOcclusionTexture,
      displacementMap: doorHeightTexture,
      displacementScale: 0.1,
      normalMap: doorNormalTexture,
      metalnessMap: doorMetalNessTexture,
      roughnessMap: doorRoughnessTexture
    })
)
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// Bushes
const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({color: '#89c854'})

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)

house.add(bush1, bush2, bush3, bush4)

// graves
const graves = new THREE.Group()
const gravesGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({color: '#b2b6b1'})

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * 6
  const radius = 3 + Math.random() * 6
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius

  const grave = new THREE.Mesh(gravesGeometry, graveMaterial)
  grave.position.set(x, 0.3, z)
  grave.rotation.z = (Math.random() - 0.5) * 0.4
  grave.rotation.x = (Math.random() - 0.5) * 0.
  grave.castShadow = true
  graves.add(grave)
}

house.add(graves)

const material = new THREE.MeshStandardMaterial({
  map: grassColorTexture,
  normalMap: grassNormalTexture,
  aoMap: grassAmbientOcclusionTexture,
  roughnessMap: grassRoughnessTexture
})
material.roughness = 0.7
material.metalness = 0

const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20),
    /*new THREE.MeshBasicMaterial({
      map: bakedShadowTexture
    })*/
    material
)
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
floor.rotation.x = -Math.PI * 0.5
floor.receiveShadow = true
scene.add(floor)


const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
scene.add(ghost2)

const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost3)

ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true
walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

floor.receiveShadow = true

// performance
doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7


let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({canvas: webgl.value})
  renderer.setSize(sizes.width, sizes.height)
  // 清除颜色
  renderer.setClearColor('#262837')
  // 阴影必须打开 渲染器shadowMap
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

const Clock = new THREE.Clock()
const render = () => {
  const elapsedTime = Clock.getElapsedTime()

  const ghost1Angle = elapsedTime * 0.5
  ghost1.position.x = Math.cos(ghost1Angle) * 4
  ghost1.position.z = Math.sin(ghost1Angle) * 4
  ghost1.position.y = Math.sin(elapsedTime * 3)


  const ghost2Angle = - elapsedTime * 0.32
  ghost2.position.x = Math.cos(ghost2Angle) * 5
  ghost2.position.z = Math.sin(ghost2Angle) * 5
  ghost2.position.y = Math.sin(elapsedTime * 4) * Math.sin(elapsedTime * 2.5)

  const ghost3Angle = - elapsedTime * 0.18
  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
  ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime *2)

  orbitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  renderInit()
})

onUnmounted(() => {
  gui.destroy()
})
</script>

<style lang="less" scoped>
</style>

