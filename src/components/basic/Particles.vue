<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {WebGLRenderer} from "three";
import StarsImage from './assets/textures/particles/2.png'

const webgl = ref()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

// 透视相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 3
scene.add(camera)

/**
 * Texture
 */

const texture = new THREE.TextureLoader()
const StarsTexture = texture.load(StarsImage)

/**
 * Particles
 */
// const particlesGeometry = new THREE.SphereBufferGeometry(1, 32, 32)

const particlesGeometry = new THREE.BufferGeometry()
const count = 20000

const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 4
  colors[i] = Math.random()
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color' , new THREE.BufferAttribute(colors, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.02
particlesMaterial.sizeAttenuation = true
// particlesMaterial.color = new THREE.Color('#ff88cc')
// particlesMaterial.map = StarsTexture
particlesMaterial.transparent = true
particlesMaterial.alphaMap = StarsTexture
// 解决图片黑色透明
// particlesMaterial.alphaTest = 0.001

// 当添加 别的场景的时候 会变成透明
// particlesMaterial.depthTest = false

particlesMaterial.depthWrite = false
// 采用混合模式
particlesMaterial.blending = THREE.AdditiveBlending

// 是否使用顶点着色。默认值为false。
particlesMaterial.vertexColors = true

// points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// cube
// const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshBasicMaterial())
// scene.add(cube)

let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({canvas: webgl.value})
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

  // particles.rotation.y = elapsedTime * 0.02
  // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
  // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
  // camera.position.y = cursor.y * 3
  // camera.lookAt(mesh.position)

  for (let i= 0; i < count; i ++) {
    const i3 = i * 3
    const x = particlesGeometry.attributes.position.array[i3]
    particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
  }

  particlesGeometry.attributes.position.needsUpdate = true

  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  renderInit()
})
</script>

<style lang="less" scoped>
</style>

