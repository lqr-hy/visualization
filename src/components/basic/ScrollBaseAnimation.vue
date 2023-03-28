<template>
  <canvas ref="webgl" class="webgl" />
  <section class="section">
    <h1>My Portfolio</h1>
  </section>
  <section class="section">
    <h2>My projects</h2>
  </section>
  <section class="section">
    <h2>Contact me</h2>
  </section>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { BufferAttribute, BufferGeometry, WebGLRenderer } from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import TextureImage from './assets/textures/gradients/3.jpg'
import gsap from 'gsap'

const webgl = ref()
const gui = new dat.GUI()

// 创建场景
const scene = new THREE.Scene()
// 设置场景大小
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const materialParams = {
  color: '#fed'
}

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// 设置相机
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
// 设置相机位置
camera.position.z = 6
// camera.position.y = 4
// 场景中添加相机
cameraGroup.add(camera)

// const cube = new THREE.BoxGeometry(1, 1, 1)
// const cubeMaterial = new THREE.MeshBasicMaterial({ color: '#f00' })
// const cubeMesh = new THREE.Mesh(cube, cubeMaterial)
// scene.add(cubeMesh)
/**
 * object
 */
/**
 * texture
 */
const texture = new THREE.TextureLoader()
const threeImageTexture = texture.load(TextureImage)
threeImageTexture.magFilter = THREE.NearestFilter

/**
 * material
 */
const material = new THREE.MeshToonMaterial({ color: materialParams.color, gradientMap: threeImageTexture })

/**
 * mesh
 */
const objectDistance = 4
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material)
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material)
const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material)
mesh1.position.y = - objectDistance * 0
mesh2.position.y = - objectDistance * 1
mesh3.position.y = - objectDistance * 2

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2
scene.add(mesh1, mesh2, mesh3)

const allMesh = [mesh1, mesh2, mesh3]

/**
 * particles 粒子
 */

const particlesCount = 200
const position = new Float32Array(particlesCount * 3)

for (let i = 0; i < position.length; i++) {
  position[i * 3 + 0] = (Math.random() - 0.5) * 10
  position[i * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * allMesh.length
  position[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new BufferGeometry()
particlesGeometry.setAttribute('position', new BufferAttribute(position, 3))

const pointMesh = new THREE.PointsMaterial({
  sizeAttenuation: true,
  size: 0.02,
  color: materialParams.color
})
const point = new THREE.Points(particlesGeometry, pointMesh)

scene.add(point)

/**
 * lights
 */

const directionalLight = new THREE.DirectionalLight('#fff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

// 监听窗口变化 更新初始化参数
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth - 240
  sizes.height = window.innerHeight - 100

  // 更新相机
  camera.aspect = sizes.width / sizes.height
  // 更新相机矩阵
  camera.updateProjectionMatrix()

  // 更新渲染器
  renderer.setSize(sizes.width, sizes.height)
  // 更新分辨率
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// 渲染文字
const fontLoader = new FontLoader()
fontLoader.load('./fonts/helvetiker_regular.typeface.json', (font) => {
  const textGeometry = new TextGeometry('Hello My Name is Lqr', {
    font: font,
    size: 0.5,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5
  })
  const renderFont = () => {
    textGeometry.center()
    const text = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({ color: materialParams.color }))
    scene.add(text)
  }

  renderFont()

  // gui.addColor(materialParams, 'color').onFinishChange(renderFont)
  gui.addColor(materialParams, 'color').onChange(() => {
    material.color.set(materialParams.color)
    pointMesh.color.set(materialParams.color)
  })
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

const cursor = {
  x: 0,
  y: 0
}

window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / sizes.width - 0.5
  cursor.y = e.clientY / sizes.height - 0.5
})

let renderer: WebGLRenderer, orbitControls: OrbitControls
// 渲染初始化
const renderInit = () => {
  // 生成渲染器
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value, alpha: true })
  // 设置渲染器大小
  renderer.setSize(sizes.width, sizes.height)
  // 设置轨道控制器
  // orbitControls = new OrbitControls(camera, renderer.domElement)
  // 设置惯性
  // orbitControls.enableDamping = true
  // 设置相机分辨率
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // 渲染
  render()
}

/**
 * scroll
 */
const scrollY = ref(0)
scrollY.value = window.scrollY
// 当前区域
let currentSection = 0
window.addEventListener('scroll', () => {
  scrollY.value = window.scrollY
  const newSection = Math.round(scrollY.value / sizes.height)

  if (newSection != currentSection) {
    currentSection = newSection

    gsap.to(allMesh[currentSection].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5'
    })
  }
})

const Clock = new THREE.Clock()
// 控制每个设备时间一致
let previousTime = 0
const render = () => {
  const elapsedTime = Clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // 滚动距离除适口高度 乘 物体距离
  camera.position.y = - scrollY.value / sizes.height * objectDistance

  const parallaxX = cursor.x * 0.5
  const parallaxY = -cursor.y * 0.5
  // 视觉移动
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

  for (const mesh of allMesh) {
    // mesh.rotation.x = elapsedTime * 0.1
    // mesh.rotation.y = elapsedTime * 0.12
    // 使用动画之后 这里需要更改成deltaTime
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.12
  }
  // 更新轨道控制器
  // orbitControls.update()
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
// html,
// body {
//   overflow: hidden;
// }


.webgl {
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
}

.section {
  display: flex;
  align-items: center;
  height: 100vh;
  position: relative;
  font-family: 'Cabin', sans-serif;
  color: #ffeded;
  text-transform: uppercase;
  font-size: 7vmin;
  padding-left: 10%;
  padding-right: 10%;
}

section:nth-child(odd) {
  justify-content: flex-end;
}
</style>

<style lang="less">
html {
  background-color: #1e1a20 !important;
}
</style>
