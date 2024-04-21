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
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
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
    mesh.visible = true;
    cannonMeshes.push(mesh);
  },
});

const debugUISphere = {
  CannonDebugger: true,
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

const ambientLight = new THREE.AmbientLight("#fff", 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#fff", 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
collisionMaterial.friction = 0; 
collisionMaterial.restitution = 0.1;

// 创建一个刚体
const combinationBody = new CANNON.Body({
  mass: 1, // 质量
  position: new CANNON.Vec3(0, 5, 0), // 位置
  material: collisionMaterial, // 材质
  collisionFilterGroup: GROUP2,
  collisionFilterMask: GROUP1 | GROUP4 | GROUP3, // 碰撞掩码
});

// 创建一个柱体
const cylinderShape = new CANNON.Cylinder(0.5, 0.5, 1.5, 20);
// 创建一个球体
const sphereShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
// 添加到刚体里面
combinationBody.addShape(cylinderShape, new CANNON.Vec3(0, 0, 0));
combinationBody.addShape(sphereShape, new CANNON.Vec3(0, 0.75, 0));
combinationBody.addShape(sphereShape, new CANNON.Vec3(0, -0.75, 0));

// 添加刚体
world.addBody(combinationBody);
phyMeshes.push(combinationBody);

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
  collisionFilterGroup: GROUP1,
  collisionFilterMask: GROUP2 | GROUP3 | GROUP4,
});
// 旋转
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
// 添加到世界
world.addBody(planeBody);

// 创建一个平面
const planeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
// 创建一个材质
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
// 创建一个网格
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
// 添加
scene.add(planeMesh);

// 创建一个柱体
const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 20);
// 创建一个材质
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// 创建一个网格
const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

// 添加
scene.add(cylinderMesh);

meshes.push(cylinderMesh);
// 创建一个球体
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
// 创建一个材质
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// 创建一个网格
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 添加到场景
cylinderMesh.add(sphereMesh);
sphereMesh.position.set(0, 0.75, 0);
const sphereMesh2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh2.position.set(0, -0.75, 0);
cylinderMesh.add(sphereMesh2);

// 创建一个盒子
const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
// 创建一个刚体
const boxBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 8, 0),
  shape: boxShape,
  material: collisionMaterial,
  collisionFilterGroup: GROUP4,
  collisionFilterMask: GROUP1 | GROUP3 | GROUP2,
});
// 添加刚体
world.addBody(boxBody);
phyMeshes.push(boxBody);

// 创建一个盒子
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// 创建一个材质
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
// 创建一个网格
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// 添加
scene.add(boxMesh);
meshes.push(boxMesh);

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./models/DamagedHelmet/glTF/DamagedHelmet.gltf",
  (gltf) => {
    const giftMesh = gltf.scene.children[0] as THREE.Mesh;
    scene.add(gltf.scene);
    meshes.push(giftMesh);

    const geometry = giftMesh.geometry as THREE.BufferGeometry;
    const vertices = geometry.attributes.position.array as number[];
    const indices = geometry.index?.array as number[];

    const trimeshShape = new CANNON.Trimesh(vertices, indices);

    const trimeshBody = new CANNON.Body({
      mass: 1,
      shape: trimeshShape,
      position: new CANNON.Vec3(0, 9, 0),
      material: collisionMaterial,
      collisionFilterGroup: GROUP3,
      collisionFilterMask: GROUP1 | GROUP4 | GROUP2,
    });

    world.addBody(trimeshBody);
    phyMeshes.push(trimeshBody);
  },
  () => {
    console.log("progress");
  },
  () => {
    console.log("error");
  }
);

const loader = new FBXLoader();
loader.load(
  "./models/fbx/Dragon.fbx",
  (fbx) => {
    console.log('fbx', fbx)
    fbx.scale.set(0.1, 0.1, 0.1);
    scene.add(fbx);
  },
  (xhr) => {
    // called while loading is progressing
    console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    // called when loading has errors
    console.error("An error happened", error);
  }
);

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
  for (let i = 0; i < phyMeshes.length; i++) {
    meshes[i].position.copy(phyMeshes[i].position as unknown as THREE.Vector3);
    meshes[i].quaternion.copy(
      phyMeshes[i].quaternion as unknown as THREE.Quaternion
    );
  }
  orbitControls.update();
  cannonDebugger.update();
  requestAnimationFrame(animation);
};

onMounted(() => {
  renderInit();
});

onUnmounted(() => {
  gui.destroy();
});
</script>