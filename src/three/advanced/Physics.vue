<template>
  <canvas ref="canvas"></canvas>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from "../../config/container";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

camera.position.set(-1, -5, 20)
scene.add(camera);

// 初始化物理
const world = new CANNON.World();
// 允许睡眠
world.allowSleep = true;
// 设置重力
world.gravity.set(0, -9.82, 0);

// 设置接触材质
const box1Material = new CANNON.Material('box1Material');
// box1Material.friction = 0;
// 设置弹性 如果 盒子和平面的弹性都是1 那么盒子会一直弹跳
// box1Material.restitution = 1;
// 可以通过设置 允许睡眠 来解决
// box1Material.allowSleep = true;
// box1Material.sleepSpeedLimit = 0.5; // 进入睡眠的速度
// box1Material.sleepTimeLimit = 1; // 进入睡眠的时间
// box1Material.frictionEquationStiffness = 1e8; // 摩擦刚度
// box1Material.frictionEquationRelaxation = 3; // 摩擦弛豫
// box1Material.frictionEquationRegularizationTime = 3; // 摩擦正则化时间
// box1Material.contactEquationStiffness = 1e8; // 接触刚度
// box1Material.contactEquationRelaxation = 3; // 接触弛豫

// 监听碰撞
// boxBody.addEventListener('collide', (e) => {
//   console.log('box1Material collide', e);
// });

// 监听睡眠
// boxBody.addEventListener('sleep', (e) => {
//   console.log('box1Material sleep', e);
// });


// 创建接触材质
const contactMaterial = new CANNON.ContactMaterial(box1Material, box1Material, {
  friction: 0.0,
  restitution: 1,
});
// 物理世界 添加接触材质
world.addContactMaterial(contactMaterial);

// 创建一个物理球体
const sphereShape = new CANNON.Sphere(0.5);
// 创建一个刚体
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: sphereShape,
  material: box1Material
});

// 添加刚体
world.addBody(sphereBody);


// 创建一个盒子
const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
// 创建一个刚体
const boxBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(1, 5, 0),
  shape: boxShape,
  material: box1Material
});
// 添加刚体
world.addBody(boxBody);

boxBody.addEventListener('collide', (e) => {
  console.log('boxBody collide', e);
});

// 创建一个光滑的盒子
const boxShape2 = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
// 创建一个刚体
const boxBody2 = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(-1.1, 5, 0),
  shape: boxShape2,
  material: new CANNON.Material({
    friction: 0, // 摩擦力
    restitution: 0.5, // 弹性
  }),
});
// 添加刚体
world.addBody(boxBody2);

// 创建物理世界的平面 平面是无限大的 会导致物理无法掉落
// const planeShape = new CANNON.Plane();
// 使用box代替平面
const planeShape = new CANNON.Box(new CANNON.Vec3(5, 0.1, 5));
const planeBody = new CANNON.Body({
  // mass: 0,
  shape: planeShape,
  position: new CANNON.Vec3(0, 0, 0),
  type: CANNON.Body.STATIC, // 静态
  material: new CANNON.Material({
    friction: 0, // 摩擦力
    restitution: 0.5, // 弹性
  })
});
// 旋转
// planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), 0.1);
planeBody.position.set(0, -6, 0);
// 添加到世界
world.addBody(planeBody);

// 创建一个球体
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
// 创建一个材质
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// 创建一个网格
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 添加到场景
scene.add(sphereMesh);

// 创建一个平面
const planeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
// 创建一个材质
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// 创建一个网格
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.position.set(0, -6, 0);
// 添加
scene.add(planeMesh);

// 创建一个盒子
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// 创建一个材质
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
// 创建一个网格
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// 添加
scene.add(boxMesh);

// 创建一个网格
const boxMesh2 = new THREE.Mesh(boxGeometry, boxMaterial);
// 添加
scene.add(boxMesh2);

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
  // 更新球体的位置和旋转
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
  // 更新盒子的位置和旋转
  boxMesh.position.set(
    boxBody.position.x,
    boxBody.position.y,
    boxBody.position.z
  );
  boxMesh.quaternion.set(
    boxBody.quaternion.x,
    boxBody.quaternion.y,
    boxBody.quaternion.z,
    boxBody.quaternion.w
  );
  // 更新盒子的位置和旋转
  boxMesh2.position.set(
    boxBody2.position.x,
    boxBody2.position.y,
    boxBody2.position.z
  );
  boxMesh2.quaternion.set(
    boxBody2.quaternion.x,
    boxBody2.quaternion.y,
    boxBody2.quaternion.z,
    boxBody2.quaternion.w
  );

  orbitControls.update();
  requestAnimationFrame(animation);
};

onMounted(() => {
  renderInit();
});
</script>