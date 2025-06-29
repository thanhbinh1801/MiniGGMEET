import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import Waiting from "@/components/Waiting.vue";
import Meeting from "@/components/Meeting.vue";

const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/waiting/:roomId", name: "Waiting", component: Waiting },
  { path: "/meeting/:roomId", name: "Meeting", component: Meeting },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
