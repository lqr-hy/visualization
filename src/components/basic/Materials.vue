<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WebGLRenderer } from 'three'
import doorColorImage from './assets/textures/door/color.jpg'
import doorAlphaImage from './assets/textures/door/alpha.jpg'
import doorAmbientOcclusionImage from './assets/textures/door/ambientOcclusion.jpg'
import doorHeightImage from './assets/textures/door/height.jpg'
import doorMetalnessImage from './assets/textures/door/metalness.jpg'
import doorNormalImage from './assets/textures/door/normal.jpg'
import doorRoughnessImage from './assets/textures/door/roughness.jpg'
import matCapsImage from './assets/textures/matcaps/1.png'
import gradientsImage from './assets/textures/gradients/5.jpg'
import * as dat from 'dat.gui'

import pxTexture from './assets/textures/environmentMaps/0/px.jpg'
import nxTexture from './assets/textures/environmentMaps/0/nx.jpg'
import pyTexture from './assets/textures/environmentMaps/0/py.jpg'
import nyTexture from './assets/textures/environmentMaps/0/ny.jpg'
import pzTexture from './assets/textures/environmentMaps/0/pz.jpg'
import nzTexture from './assets/textures/environmentMaps/0/nz.jpg'

const textures = new THREE.TextureLoader()
const doorColorTextures = textures.load(doorColorImage)
const doorAlphaTextures = textures.load(doorAlphaImage)
const doorAmbientOcclusionTextures = textures.load(doorAmbientOcclusionImage)
const doorHeightTextures = textures.load(doorHeightImage)
const doorMetalnessTextures = textures.load(doorMetalnessImage)
const doorNormalTextures = textures.load(doorNormalImage)
const doorRoughnessTextures = textures.load(doorRoughnessImage)
const matCapsTextures = textures.load(matCapsImage)
const gradientsTextures = textures.load(gradientsImage)

const cubeTextures = new THREE.CubeTextureLoader()
const cubeTexturesList = cubeTextures.load([
  pxTexture,
  nxTexture,
  pyTexture,
  nyTexture,
  pzTexture,
  nzTexture
])

const webgl = ref()

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
camera.position.z = 3
scene.add(camera)

// const material = new THREE.MeshBasicMaterial()
// 普通纹理
// material.map = doorColorTextures

// 设置展示面
// 前面
// material.side = THREE.FrontSide
// 后面
// material.side = THREE.BackSide
// 双面 但是比较占用cpu
// material.side = THREE.DoubleSide

// 设置颜色
// material.color.set('yellow')

// 网格展示
// material.wireframe = true

// 设透明度
// material.transparent = true
// material.opacity = 0.5

// 透明纹理
// material.transparent = true
// material.alphaMap = doorAlphaTextures

// const material = new THREE.MeshNormalMaterial()
// // 使用平面着色
// material.flatShading = true

// material.wireframe = true

// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matCapsTextures

// 深度网格材质
// const material = new THREE.MeshDepthMaterial()

//一种非光泽表面的材质，没有镜面高光。
// const material = new THREE.MeshLambertMaterial()

//一种用于具有镜面高光的光泽表面的材质。
// const material = new THREE.MeshPhongMaterial()
// 修改高亮层度
// material.shininess = 100
// 反光颜色
// material.specular = new THREE.Color('red')

// const material = new THREE.MeshToonMaterial()
// // 使用过滤解决展示色阶问题
// gradientsTextures.minFilter = THREE.NearestFilter
// gradientsTextures.magFilter = THREE.NearestFilter
// gradientsTextures.generateMipmaps = false
// material.gradientMap = gradientsTextures

// const material = new THREE.MeshStandardMaterial()
// 粗糙度
// material.roughness = 0.65
// material.metalness = 0.45
// material.map = doorColorTextures
// material.aoMap = doorAmbientOcclusionTextures
// material.aoMapIntensity = 1
// material.displacementMap = doorHeightTextures
// material.displacementScale = 0.5
// material.roughnessMap = doorRoughnessTextures
// material.metalnessMap = doorMetalnessTextures
// material.normalMap = doorNormalTextures
// material.normalScale.set(0.5, 0.5)
// material.transparent = true
// material.alphaMap = doorAlphaTextures

const material = new THREE.MeshStandardMaterial()
// 粗糙度
material.roughness = 0.1
material.metalness = 0.7
material.envMap = cubeTexturesList

scene.environment = cubeTexturesList
scene.background = cubeTexturesList
/**
 * Debug
 */
const gui = new dat.GUI()

gui.add(material, 'roughness').min(0).max(1).step(0.0001)
gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.001)
gui.add(material, 'displacementScale').min(0).max(1).step(0.001)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16), material)
sphere.position.x = -1.5
sphere.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
)
scene.add(sphere)
// console.log(sphere.geometry.attributes)

const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 100, 100), material)
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))

scene.add(plane)

const torus = new THREE.Mesh(new THREE.TorusBufferGeometry(0.3, 0.2, 16, 32), material)
torus.position.x = 1.5
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))

scene.add(torus)

const Clock = new THREE.Clock()

let renderer: WebGLRenderer, orbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

const render = () => {
  const elapsedTime = Clock.getElapsedTime()

  // sphere.rotation.y = 0.1 * elapsedTime
  // torus.rotation.y = 0.1 * elapsedTime
  // plane.rotation.y = 0.1 * elapsedTime

  // sphere.rotation.x = 0.15 * elapsedTime
  // plane.rotation.x = 0.15 * elapsedTime
  // torus.rotation.x = 0.15 * elapsedTime

  orbitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  renderInit()
})

</script>

<style lang="less" scoped>
</style>

