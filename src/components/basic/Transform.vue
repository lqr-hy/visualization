<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted,  ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const webgl = ref()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}
// 相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

const cube = new THREE.BoxGeometry(1, 1, 1)
const meshMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
})
const mesh = new THREE.Mesh(cube, meshMaterial)
scene.add(mesh)

// Position
// mesh.position.x = 0.7
// mesh.position.y = -0.6
// mesh.position.z = 1
mesh.position.set(0.7, -0.6, 1)

// 计算从(0, 0, 0) 到 (x, y, z)的欧几里得长度 （Euclidean length，即直线长度）
// console.log(mesh.position.length())
// // 计算该向量到所传入的v间的距离 这个时候传入的是相机的位置
// console.log(mesh.position.distanceTo(camera.position))
// //将该向量转换为单位向量（unit vector）， 也就是说，将该向量的方向设置为和原向量相同，但是其长度（length）为1。
// console.log(mesh.position.normalize())
// console.log(mesh.position.length())

// Scale
// mesh.scale.x = 2
// mesh.scale.y = 0.5
// mesh.scale.z = 0.5
mesh.scale.set(1, 1, 1)

// Rotation
// 改变旋转顺序
mesh.rotation.reorder('YXZ')
mesh.rotation.x = 1
mesh.rotation.y = 1
// mesh.rotation.z = 1

// 相机看向的位置
camera.lookAt(mesh.position)

// 添加一个组 
const group = new THREE.Group()
scene.add(group)

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
)
group.add(cube1)

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
)
cube2.position.x = 2
group.add(cube2)

group.position.y = 1

// 辅助线
const axes = new THREE.AxesHelper(5)
scene.add(axes)

let renderer, orbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

const render = () => {
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

