<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BufferGeometry, PointsMaterial, WebGLRenderer } from 'three'
import * as dat from 'dat.gui'

const webgl = ref()
const gui = new dat.GUI()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

/**
 * Galaxy
 */
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5, // 半径
  branches: 3, // 分支
  spin: 1, // 旋转角度
  randomness: 0.2, // 随机性
  randomnessPower: 3, // 随机概率
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
}

let geometry: BufferGeometry | null = null
let material: PointsMaterial | null = null
let points: THREE.Points | null = null

const generateGalaxy = () => {
  /**
   * destroy olg galaxy
   */
  if (points !== null) {
    geometry?.dispose()
    material?.dispose()
    scene.remove(points)
  }

  /**
   * geometry
   */
  geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)

  const insideColor = new THREE.Color(parameters.insideColor)
  const outsideColor = new THREE.Color(parameters.outsideColor)

  for (let index = 0; index < parameters.count * 3; index++) {
    const i3 = index * 3
    // 半径
    const radius = Math.random() * parameters.radius
    // 旋转角度
    const spinAngle = radius * parameters.spin
    // 分支角度
    const branchesAngle = ((index % parameters.branches) / parameters.branches) * Math.PI * 2
    // const randomX = (Math.random() - 0.5) * parameters.randomness * radius
    // const randomY = (Math.random() - 0.5) * parameters.randomness * radius
    // const randomZ = (Math.random() - 0.5) * parameters.randomness * radius

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

    positions[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX
    positions[i3 + 1] = randomY
    positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ

    // Colors
    // copy color
    const mixinColor = insideColor.clone()
    mixinColor.lerp(outsideColor, radius / parameters.radius)
    colors[i3] = mixinColor.r
    colors[i3 + 1] = mixinColor.g
    colors[i3 + 2] = mixinColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  /**
   * material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size, // 设置点的大小
    sizeAttenuation: true, // 指定点的大小是痘因相机深度而减弱
    depthWrite: false, // 渲染此材质是否对深度缓冲区有任何影响
    blending: THREE.AdditiveBlending, // 在使用此材质显示对象是要使用何种混合
    vertexColors: true //  是否使用定点着色器
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)
}

generateGalaxy()

gui.add(parameters, 'count').min(1000).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(0).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

// 透视相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 10
camera.position.y = 3
scene.add(camera)

/**
 * Texture
 */

let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

const cursor = {
  x: 0,
  y: 0
}
window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = -(event.clientY / sizes.height - 0.5)
})

const Clock = new THREE.Clock()

const render = () => {
  orbitControls.update()
  const elapsedTime = Clock.getElapsedTime()
  if (points) {
    points.rotation.y = 0.15 * elapsedTime
  }

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

