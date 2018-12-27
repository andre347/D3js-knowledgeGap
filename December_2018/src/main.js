import Vue from "vue";
import App from "./App.vue";
import * as d3 from "d3";

Vue.config.productionTip = false;
Vue.use(d3);

new Vue({
  render: h => h(App)
}).$mount("#app");
