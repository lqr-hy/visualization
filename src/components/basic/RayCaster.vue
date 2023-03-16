<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BufferGeometry, Intersection, PointsMaterial, SphereBufferGeometry, WebGLRenderer } from 'three'
import * as dat from 'dat.gui'

const webgl = ref()
const gui = new dat.GUI()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}
// Sphere
const object1 = new THREE.Mesh(new SphereBufferGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: '#ff0000' }))
object1.position.x = 0
const object2 = new THREE.Mesh(new SphereBufferGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: '#ff0000' }))
object2.position.x = -2
const object3 = new THREE.Mesh(new SphereBufferGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: '#ff0000' }))
object3.position.x = 2
scene.add(object1, object2, object3)


// RayCaster 光线投射器
const raycaster = new THREE.Raycaster()

// 射线原点
const rayOrigin = new THREE.Vector3(-3, 0, 0)
const rayDirection = new THREE.Vector3(10, 0, 0)
rayDirection.normalize()
// 设置原点和 目标点
raycaster.set(rayOrigin, rayDirection)

// 相交
// const intersect = raycaster.intersectObject(object1)
// console.log(intersect)

// 透视相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 5
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

let currentIntersect: Intersection | null = null

const Clock = new THREE.Clock()

const render = () => {
  orbitControls.update()
  const elapsedTime = Clock.getElapsedTime()

  object2.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object1.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.5) * 1.5

  // const rayOrigin = new THREE.Vector3(-3, 0, 0)
  // const rayDirection = new THREE.Vector3(1, 0, 0)
  // rayDirection.normalize()
  // raycaster.set(rayOrigin, rayDirection)

  raycaster.setFromCamera(mouse, camera)
  const objectToTest = [object2, object1, object3]
  const intersects = raycaster.intersectObjects(objectToTest)

  for (const object of objectToTest) {
    object.material.color.set('#f00')
  }

  // 相交射线的时候设置为蓝色
  for (const intersect of intersects) {
    intersect.object.material.color.set('#00f')
  }

  if (intersects.length) {
    if (currentIntersect === null) {
      console.log('mouse enter')
    }
    currentIntersect = intersects[0]
  } else {
    if (currentIntersect) {
      console.log('mouse leave')
    }
    currentIntersect = null
  }

  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

/**
 * mouse
 */

const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX - 240) / sizes.width * 2 - 1
  mouse.y = -((e.clientY - 100) / sizes.height) * 2 + 1
  // console.log(mouse.x, mouse.y)
})

/**
 * click
 */
window.addEventListener('click', () => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log('click on object1')
        break
      case object2:
        console.log('click on object2')
        break
      case object3:
        console.log('click on object3')
        break
      default:

    }
  }
})

onMounted(() => {
  renderInit()
})

onUnmounted(() => {
  gui.destroy()
})
</script>

<style lang="less" scoped></style>

