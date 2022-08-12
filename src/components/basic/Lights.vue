<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WebGLRenderer } from 'three'
import * as dat from 'dat.gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

const webgl = ref()

const gui = new dat.GUI()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 260,
  height: window.innerHeight - 100
}

window.addEventListener('resize', () => {
  // 更新sizes大小
  sizes.width = window.innerWidth - 260
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

const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

const cube = new THREE.BoxGeometry(1, 1, 1)
const cubeMesh = new THREE.Mesh(cube, material)

scene.add(cubeMesh)

const sphere = new THREE.SphereBufferGeometry(0.5, 16, 16)
const sphereMesh = new THREE.Mesh(sphere, material)
sphereMesh.position.x = -1.5
scene.add(sphereMesh)

const torus = new THREE.TorusBufferGeometry(0.5, 0.2, 16, 32)
const torusMesh = new THREE.Mesh(torus, material)
torusMesh.position.x = 1.5
scene.add(torusMesh)

const plane = new THREE.PlaneBufferGeometry(5, 5)
const planeMesh = new THREE.Mesh(plane, material)
planeMesh.rotation.x = -Math.PI / 2
planeMesh.position.y = -1
scene.add(planeMesh)

// 环境灯  灯光颜色 灯光强度
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)

// 平行灯
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.4)
// 改变灯光位置
directionalLight.position.set(0, -1, 0)
scene.add(directionalLight)

//  半球光
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.5)
scene.add(hemisphereLight)

// 点 光源
const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2)
pointLight.position.set(1, -0.5, 1)
scene.add(pointLight)

// 平面光 光源
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 2, 1)
rectAreaLight.position.set(-1.5, 0.5, 1.5)
// 表示看向中心点
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

// 聚光灯
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)

// 跟随目标
spotLight.target.position.x = -0.75
// 必须把目标添加到场景中
scene.add(spotLight.target)


// 灯光辅助线
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
scene.add(hemisphereLightHelper)

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
scene.add(directionalLightHelper)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)

const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper)

 //  更新位置
 window.requestAnimationFrame (() => {
  spotLightHelper.update()
 })

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
scene.add(rectAreaLightHelper)

window.requestAnimationFrame (() => {
  rectAreaLightHelper.updateMatrixWorld()
})

let renderer: WebGLRenderer, orbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

const Clock = new THREE.Clock()
const render = () => {
  const elapsedTime = Clock.getElapsedTime()

  sphereMesh.rotation.x = 0.15 * elapsedTime
  torusMesh.rotation.x = 0.15 * elapsedTime
  cubeMesh.rotation.x = 0.15 * elapsedTime

  sphereMesh.rotation.y = 0.1 * elapsedTime
  torusMesh.rotation.y = 0.1 * elapsedTime
  cubeMesh.rotation.y = 0.1 * elapsedTime
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

