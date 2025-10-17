import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Editor from '@/pages/Editor.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/editer', name: 'editer', component: Editor },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router


