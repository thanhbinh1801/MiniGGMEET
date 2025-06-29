import Vue from "vue";
import Router from "vue-router";
import Login from "@/views/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import Waiting from "@/views/Waiting.vue";
import Meeting from "@/views/Meeting.vue";

Vue.use(Router);

export default new Router({
  routes: [
    { path: "/", name: "Login", component: Login },
    { path: "/dashboard", name: "Dashboard", component: Dashboard },
    { path: "/waiting/:roomId", name: "Waiting", component: Waiting },
    { path: "/meeting/:roomId", name: "Meeting", component: Meeting },
  ],
});
