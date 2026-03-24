import { createRouter, createWebHistory } from "vue-router";
import {
  setNavigationTitle
} from "dingtalk-jsapi";
import {
  useMain
} from "stores";
// const modules = import.meta.glob('pages/**/*.vue');
// console.log(22, modules);



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("pages/Home/Index.vue"),
      meta: {
        title: "",
        keepAlive: true,
      },
      props: {
        isEditor: false,
      },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});
router.beforeEach((to, from) => {
  const {
    runningEnv
  } = useMain();
  if(runningEnv === 2) {
    setNavigationTitle(to.meta.title);
  }
  document.title = to.meta.title
})
export default router
