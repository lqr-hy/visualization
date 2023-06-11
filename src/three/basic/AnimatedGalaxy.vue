<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import * as DAT from 'dat.gui'
import { onMounted, onUnmounted, ref } from "vue"
import { BufferGeometry, ShaderMaterial, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import vertexShader from './AnimatedGalaxyShader/vertex.glsl'
import fragmentShader from './AnimatedGalaxyShader/fragment.glsl'


const gui = new DAT.GUI()

const webgl = ref()

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 3, 3)
scene.add(camera)

let geometry: BufferGeometry
let material: ShaderMaterial
let point: THREE.Points

const parameters = {
  count: 200000,
  size: 0.01,
  radius: 5, // 半径
  branches: 3, // 分支
  spin: 1, // 旋转角度
  randomness: 0.2, // 随机性
  randomnessPower: 3, // 随机概率
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
}

const createGalaxy = () => {
  if (point !== null) {
    geometry?.dispose()
    material?.dispose()
    scene.remove(point)
  }
  geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)
  const aScale = new Float32Array(parameters.count)
  const randomness = new Float32Array(parameters.count * 3)

  const insideColor = new THREE.Color(parameters.insideColor)
  const outsideColor = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // Position
    const radius = Math.random() * parameters.radius

    const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2

    const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius
    const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius
    const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius

    randomness[i3] = randomX;
    randomness[i3 + 1] = randomY;
    randomness[i3 + 2] = randomZ;

    positions[i3] = Math.cos(branchAngle) * radius
    positions[i3 + 1] = 0
    positions[i3 + 2] = Math.sin(branchAngle) * radius

    // Color
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b

    aScale[i] = Math.random()
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(aScale, 1))
  geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

  material = new THREE.ShaderMaterial({
    depthWrite: false, // 渲染此材质是否对深度缓冲区有任何影响
    blending: THREE.AdditiveBlending, // 在使用此材质显示对象是要使用何种混合
    vertexColors: true, //  是否使用定点着色器
    vertexShader,
    fragmentShader,
    uniforms: {
      uSize: { value: 30.0 * renderer.getPixelRatio() },
      uTime: { value: 0 }
    }
  })

  point = new THREE.Points(geometry, material)
  scene.add(point)
}

let renderer: WebGLRenderer, orBitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orBitControls = new OrbitControls(camera, renderer.domElement)
  orBitControls.enableDamping = true
  render()
}

const Clock = new THREE.Clock()
const render = () => {
  const elapsedTime = Clock.getElapsedTime()

  if (material) {
    material.uniforms.uTime.value = elapsedTime
  }

  orBitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth - 240
  sizes.height = window.innerHeight - 100

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

onMounted(() => {
  renderInit()
  createGalaxy()
})

onUnmounted(() => {
  gui.destroy()
})
</script>

<style scoped>

</style>