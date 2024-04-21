import { createRouter, createWebHashHistory, RouteRecordRaw, } from 'vue-router'

const routes = [
  {
    path: '/test',
    component: () => import('../pages/Test.vue')
  },
  {
    path: '/',
    component: () => import('../pages/Index.vue'),
    redirect: 'basic',
    children: [
      {
        path: 'basic',
        name: 'basic',
        redirect: '/basic/FirstScene'
      },
      {
        path: 'advanced',
        name: 'advanced',
        redirect: '/advanced'
      },
      {
        path: 'webgpu',
        name: 'webgpu',
        redirect: '/webgpu/index'
      },
      {
        path: 'projects',
        name: 'projects',
        redirect: '/projects/house'
      }
    ]
  },
  {
    path: '/scrollBaseAnimation',
    component: () => import('../three/basic/ScrollBaseAnimation.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

interface IRouter {
  [key: string]: RouteRecordRaw
}

const allModule = await import.meta.glob('../../src/**/*.vue')
const cate = ['basic', 'advanced', 'webgpu', 'projects']
export let childRouteModule: IRouter = {}
for (const module in allModule) {
  cate.forEach(catePath => {
    if (module.includes(catePath)) {
      ; // @ts-ignore
      (childRouteModule[catePath] || (childRouteModule[catePath] = [])).push({
        path: module.match(/[a-zA-z]+(?=\.vue)/)![0],
        component: allModule[module]
      })
    }
  })
}

for (const childRouteModuleKey in childRouteModule) {
  (childRouteModule[childRouteModuleKey] as any).forEach((childPath: RouteRecordRaw) => {
    router.addRoute(childRouteModuleKey, childPath)
  })
}

export default router
