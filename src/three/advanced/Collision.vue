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

camera.position.set(1, 5, 15);
scene.add(camera);

// 初始化物理
const world = new CANNON.World();
// 设置重力
world.gravity.set(0, -9.82, 0);

// 设置碰撞组
const GROUP1 = 1;
const GROUP2 = 2;
const GROUP3 = 4;
const GROUP4 = 8;

// 创建碰撞材质
const collisionMaterial = new CANNON.Material("collisionMaterial");
collisionMaterial.friction = 0;
// collisionMaterial.restitution = 1;
// 创建接触材质
const contactMaterial = new CANNON.ContactMaterial(collisionMaterial, collisionMaterial, {
  friction: 0,
  // restitution: 1,
});

// 创建一个物理球体
const sphereShape = new CANNON.Sphere(0.5);
// 创建一个刚体
const sphereBody = new CANNON.Body({
  mass: 1, // 质量
  position: new CANNON.Vec3(0, 0.5, 0), // 位置
  shape: sphereShape, // 形状
  material: collisionMaterial, // 材质
  collisionFilterGroup: GROUP2, // 碰撞组
  collisionFilterMask: GROUP1 | GROUP4, // 碰撞掩码
});

// 添加刚体
world.addBody(sphereBody);

// 创建一个盒子
const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
// 创建一个刚体
const boxBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(2, 0.5, 0),
  shape: boxShape,
  material: collisionMaterial,
  collisionFilterGroup: GROUP3,
  collisionFilterMask: GROUP1 | GROUP4,
});
// 添加刚体
world.addBody(boxBody);

// 创建一个柱体
const cylinderShape = new CANNON.Cylinder(0.5, 0.5, 1, 32);
// 创建一个刚体
const cylinderBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(-2, 0.5, 0),
  shape: cylinderShape, 
  material: collisionMaterial,
  collisionFilterGroup: GROUP1,
  collisionFilterMask: GROUP2 | GROUP3 | GROUP4, 
});
// 添加刚体
world.addBody(cylinderBody);

// 使用box代替平面
const planeShape = new CANNON.Box(new CANNON.Vec3(5, 0.1, 5));
const planeBody = new CANNON.Body({
  // mass: 0,
  shape: planeShape,
  position: new CANNON.Vec3(0, -0.1, 0),
  type: CANNON.Body.STATIC, // 静态
  material: collisionMaterial,
  collisionFilterGroup: GROUP4,
  collisionFilterMask: GROUP1 | GROUP3 | GROUP2,
});
// 旋转
// planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), 0.1);
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

// 创建一个柱体
const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
// 创建一个材质
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// 创建一个网格
const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
// 添加
scene.add(cylinderMesh);

// 设置柱体的初始速度
cylinderBody.velocity.set(2, 0, 0);

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

  // 更新柱体的位置和旋转
  cylinderMesh.position.set(
    cylinderBody.position.x,
    cylinderBody.position.y,
    cylinderBody.position.z
  );
  cylinderMesh.quaternion.set(
    cylinderBody.quaternion.x,
    cylinderBody.quaternion.y,
    cylinderBody.quaternion.z,
    cylinderBody.quaternion.w
  );


  orbitControls.update();
  requestAnimationFrame(animation);
};

onMounted(() => {
  renderInit();
});
</script>