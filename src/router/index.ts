import { createRouter, createWebHashHistory } from 'vue-router'

const BasicChildren = [
  {
    path: 'first-scene',
    component: () => import('../components/basic/FirstScene.vue')
  },
  {
    path: 'transform',
    component: () => import('../components/basic/Transform.vue')
  },
  {
    path: 'animation',
    component: () => import('../components/basic/Animation.vue')
  },
  {
    path: 'camera',
    component: () => import('../components/basic/Camera.vue')
  },
  {
    path: 'fullscreen',
    component: () => import('../components/basic/Fullscreen.vue')
  },
  {
    path: 'geometry',
    component: () => import('../components/basic/Geometry.vue')
  },
  {
    path: 'textures',
    component: () => import('../components/basic/Textures.vue')
  },
  {
    path: 'materials',
    component: () => import('../components/basic/Materials.vue')
  },
  {
    path: 'threeD-text',
    component: () => import('../components/basic/ThreeDText.vue')
  },
  {
    path: 'lights',
    component: () => import('../components/basic/Lights.vue')
  },
  {
    path: 'shadow',
    component: () => import('../components/basic/Shadow.vue')
  },
  {
    path: 'particles',
    component: () => import('../components/basic/Particles.vue')
  },
  {
    path: 'galaxy',
    component: () => import('../components/basic/Galaxy.vue')
  },
  {
    path: 'rayCaster',
    component: () => import('../components/basic/RayCaster.vue')
  },
  {
    path: 'physics',
    component: () => import('../components/basic/Physics.vue')
  },
  {
    path: 'models',
    component: () => import('../components/basic/Models.vue')
  },
  {
    path: 'realistic',
    component: () => import('../components/basic/Realistic.vue')
  },
  {
    path: 'shaders',
    component: () => import('../components/basic/Shaders.vue')
  },
  {
    path: 'shaders-patterns',
    component: () => import('../components/basic/ShaderPatterns.vue')
  },
  {
    path: 'raging-sea',
    component: () => import('../components/basic/RagingSea.vue')
  },
  {
    path: 'animated-galaxy',
    component: () => import('../components/basic/AnimatedGalaxy.vue')
  }
]

const ProjectChildren = [
  {
    path: 'house',
    component: () => import('../components/projects/House.vue')
  }
]

const routes = [
  {
    path: '/test',
    component: () => import('../pages/Test.vue')
  },
  {
    path: '/',
    component: () => import('../pages/Index.vue'),
    redirect: '/basic',
    children: [
      {
        path: 'basic',
        redirect: '/basic/galaxy',
        children: BasicChildren
      },
      {
        path: 'projects',
        redirect: '/projects/house',
        children: ProjectChildren
      }
    ]
  },
  {
    path: '/scrollBaseAnimation',
    component: () => import('../components/basic/ScrollBaseAnimation.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
