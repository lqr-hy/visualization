<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import * as DAT from 'dat.gui'
import { onMounted, onUnmounted, ref } from "vue"
import { WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import vertexShader from './RagingSeaShader/vertex.glsl'
import fragmentShader from './RagingSeaShader/fragment.glsl'

const gui = new DAT.GUI({ width: 400 })

const debugObject = {
  depthColor: '#186691',
  surfaceColor: '#9bd8ff'
}

const webgl = ref()

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
)
camera.position.set(1, 1, 1)
scene.add(camera)

const plane = new THREE.PlaneGeometry(30, 30, 512, 512)
const planeMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    // elevation 高程 提升
    uBigWavesElevation: { value: 0.2 },
    // frequency 频率
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uTime: { value: 0 },
    uBigWavesSpeed: { value: 0.75 },
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    // surface 表面的
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.08 },
    // multiplier 背增器
    uColorMultiplier: { value: 5 },

    // 最小海拔
    uSmallWavesElevation: { value: 0.15 },
    // 最小评率
    uSmallWavesFrequency: { value: 3 },
    //
    uSmallWavesSpeed: { value: 0.3 },
    uSmallWavesIterations: { value: 4.0 },
  }
})
gui.add(planeMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(planeMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(planeMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(planeMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')
gui.add(planeMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(planeMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(planeMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(planeMaterial.uniforms.uSmallWavesIterations, 'value').min(0).max(5).step(1).name('uSmallWavesIterations')

gui.add(planeMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(planeMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')
gui
    .addColor(debugObject, 'depthColor')
    .name('depthColor')
    .onChange(() => planeMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor))
gui
    .addColor(debugObject, 'surfaceColor')
    .name('surfaceColor')
    .onChange(() => planeMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor))


const planeMash = new THREE.Mesh(plane, planeMaterial)
planeMash.rotation.x = -Math.PI * 0.5
scene.add(planeMash)

let renderer: WebGLRenderer, orBitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0))
  orBitControls = new OrbitControls(camera, renderer.domElement)
  orBitControls.enableDamping = true
  render()
}

const Clock = new THREE.Clock()
const render = () => {
  const elapsedTime = Clock.getElapsedTime()
  planeMaterial.uniforms.uTime.value = elapsedTime

  orBitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

const resizeCanvas = () => {
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
}

onMounted(() => {
  renderInit()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  gui.destroy()
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>

</style>