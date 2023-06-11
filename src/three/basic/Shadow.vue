<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {WebGLRenderer} from 'three'
import * as dat from 'dat.gui'
// import bakedShadow from './assets/textures/bakedShadow.jpg'
import simpleShadow from './assets/textures/simpleShadow.jpg'

const textureLoader = new THREE.TextureLoader()
// const bakedShadowTexture = textureLoader.load(bakedShadow)
const simpleShadowTexture = textureLoader.load(simpleShadow)


const webgl = ref()

const gui = new dat.GUI()

// 创建场景
const scene = new THREE.Scene()
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
camera.position.x = 2
camera.position.y = 1
camera.position.z = 4
scene.add(camera)

// 环境灯  灯光颜色 灯光强度
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)

// 平行灯
const directionalLight = new THREE.DirectionalLight(0xfffffff, 0.3)
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

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

// 聚光灯
const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3)

spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6


const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)

spotLight.position.set(0, 2, 2)
spotLight.castShadow = true

scene.add(spotLight)
scene.add(spotLight.target)

// 点光源
const pointLight = new THREE.PointLight(0xfffffff, 0.3)

pointLight.castShadow = true
pointLight.position.set(-1, 1, 0)
pointLight.shadow.camera.far = 5
pointLight.shadow.camera.near = 0.1
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024

scene.add(pointLight)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)

const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
material.metalness = 0

// 球体
const sphere = new THREE.SphereGeometry(0.5, 32, 32)
const sphereMesh = new THREE.Mesh(sphere, material)
sphereMesh.castShadow = true

sphereMesh.position.y = 1

gui.add(sphereMesh.position, 'y').min(-2).max(5).name('sphereY').step(0.1)
scene.add(sphereMesh)

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5),
    /*new THREE.MeshBasicMaterial({
      map: bakedShadowTexture
    })*/
    material
)

plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.5
plane.receiveShadow = true
scene.add(plane)


const sphereShadow = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      alphaMap: simpleShadowTexture
    })
)

sphereShadow.position.y = plane.position.y + 0.01
sphereShadow.rotation.x = -Math.PI * 0.5
scene.add(sphereShadow)

let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({canvas: webgl.value})
  renderer.setSize(sizes.width, sizes.height)
  // 阴影必须打开 渲染器shadowMap
  renderer.shadowMap.enabled = false
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

const Clock = new THREE.Clock()
const render = () => {
  const elapsedTime = Clock.getElapsedTime()

  sphereMesh.rotation.x = 0.15 * elapsedTime

  sphereMesh.rotation.y = 0.1 * elapsedTime

  sphereMesh.position.x = Math.cos(elapsedTime) * 1.5
  sphereMesh.position.z = Math.sin(elapsedTime) * 1.5
  sphereMesh.position.y = Math.abs(Math.sin(elapsedTime * 3))

  // update sphereShadow
  sphereShadow.position.x = sphereMesh.position.x
  sphereShadow.position.z = sphereMesh.position.z
  sphereShadow.material.opacity = (1 - sphereMesh.position.y) * 0.3

  orbitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  renderInit()
})

onUnmounted(() => {
  console.log('-0')
  gui.destroy()
})
</script>

<style lang="less" scoped>
</style>

