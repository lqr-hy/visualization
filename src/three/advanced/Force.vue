<template>
  <canvas ref="canvas"></canvas>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from "../../config/container";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import CannonDebugger from "cannon-es-debugger";
import * as dat from "dat.gui";
const gui = new dat.GUI();

const canvas = ref<HTMLCanvasElement | null>(null);

// 创建场景
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth - CONTAINER_WIDTH,
  height: window.innerHeight - CONTAINER_HEIGHT,
};

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

camera.position.set(1, 5, 15);
scene.add(camera);

// 初始化物理
const world = new CANNON.World();
// 设置重力
world.gravity.set(0, -9.82, 0);

let phyMeshes: CANNON.Body[] = [];
let meshes: THREE.Mesh[] = [];

/**
 * debugger
 */
const cannonMeshes: THREE.Mesh[] = [];
const cannonDebugger = CannonDebugger(scene, world, {
  onInit(body, mesh) {
    mesh.visible = false;
    cannonMeshes.push(mesh);
  },
});

const debugUISphere = {
  CannonDebugger: false,
};
gui
  .add(debugUISphere, "CannonDebugger")
  .name("CannonDebugger mesh visible")
  .onChange((value: boolean) => {
    console.log(value);
    if (value) {
      cannonMeshes.forEach((item) => {
        item.visible = true;
      });
    } else {
      cannonMeshes.forEach((item) => {
        item.visible = false;
      });
    }
  });

// 辅助线
const axes = new THREE.AxesHelper(10);
scene.add(axes);

// 设置碰撞组
const GROUP1 = 1;
const GROUP2 = 2;
const GROUP3 = 4;
const GROUP4 = 8;

// 创建碰撞材质
const collisionMaterial = new CANNON.Material("collisionMaterial");
collisionMaterial.friction = 1;
collisionMaterial.restitution = 0;

// 创建一个平面
const planeShape = new CANNON.Plane();
// 使用box代替平面
// const planeShape = new CANNON.Box(new CANNON.Vec3(5, 0.1, 5));
const planeBody = new CANNON.Body({
  // mass: 1,
  shape: planeShape,
  position: new CANNON.Vec3(0, 0, 0),
  type: CANNON.Body.STATIC, // 静态
  material: collisionMaterial,
});
// 旋转
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
// 添加到世界
world.addBody(planeBody);

// 创建一个球体
const sphereShape = new CANNON.Sphere(0.5);

// 创建一个刚体
const sphereBody = new CANNON.Body({
  mass: 1, // 质量
  position: new CANNON.Vec3(-4, 0.5, 0), // 位置
  // material: collisionMaterial, // 材质
  shape: sphereShape,
});

// 添加刚体
world.addBody(sphereBody);

const box = new CANNON.Box(new CANNON.Vec3(0.3, 0.3, 0.7));
// for (let i = 1; i < 10; i++) {
//   console.log(i * 0.3 + (i === 0 ? 0 : 0.3))
//   const boxBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(3, i * 0.3 + (i === 0 ? 0 : 0.3), 0),
//     material: collisionMaterial,
//     shape: box
//   });
//   world.addBody(boxBody);
// }

// const boxBody2 = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(3, 0, 0),
//   material: collisionMaterial,
//   shape: box
// });
// world.addBody(boxBody2);

// const boxBody = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(3, 1.2, 0),
//   material: collisionMaterial,
//   shape: box
// });
// world.addBody(boxBody);

const size = 0.5;
const mass = 1;
const gap = 0.02;

// Layers
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 3; j++) {
    const body = new CANNON.Body({ mass });

    let halfExtents;
    let dx;
    let dz;
    if (i % 2 === 0) {
      halfExtents = new CANNON.Vec3(size, size, size * 3);
      dx = 1;
      dz = 0;
    } else {
      halfExtents = new CANNON.Vec3(size * 3, size, size);
      dx = 0;
      dz = 1;
    }

    const shape = new CANNON.Box(halfExtents);
    body.addShape(shape);
    // body.material = collisionMaterial;
    body.position.set(
      2 * (size + gap) * (j - 1) * dx,
      2 * (size + gap) * (i + 1),
      2 * (size + gap) * (j - 1) * dz
    );

    world.addBody(body);
  }
}

// 创建一个平面
const planeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
// 创建一个材质
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// 创建一个网格
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.position.set(0, -0.05, 0);
// 添加
scene.add(planeMesh);

// 创建一个球体
const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
// 创建一个材质
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
});
// 创建一个网格
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 添加到场景
sphereMesh.position.set(0, 0.5, 0);
scene.add(sphereMesh);

// 创建渲染器
let renderer: THREE.WebGLRenderer, orbitControls: OrbitControls;
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value!,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  animation();
};

let clock = new THREE.Clock();
const animation = () => {
  let delta = clock.getDelta();
  renderer.render(scene, camera);
  // 更新物理世界
  world.step(1 / 60, delta, 3);

  // 更新物理模型
  sphereMesh.position.set(
    sphereBody.position.x,
    sphereBody.position.y,
    sphereBody.position.z
  );
  sphereMesh.quaternion.set(
    sphereBody.quaternion.x,
    sphereBody.quaternion.y,
    sphereBody.quaternion.z,
    sphereBody.quaternion.w
  );

  orbitControls.update();
  cannonDebugger.update();
  requestAnimationFrame(animation);
};
console.log("1");
addEventListener("click", () => {
  console.log("click");
  sphereBody.applyLocalImpulse(
    new CANNON.Vec3(1, 0, 0),
    new CANNON.Vec3(0, 0.5, 0)
  );
});

onMounted(() => {
  renderInit();
});

onUnmounted(() => {
  gui.destroy();
});
</script>