<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue"
import Design from './components/Design.vue'
import Schema from './components/Schema.vue'
const dynamicComp = "Design" 
// 动态引入主键
const PageDrawer = defineAsyncComponent(() =>import(`./components/${dynamicComp}.vue`))
// 当前要渲染的组件
const resolvedComponent = ref(PageDrawer)
function qh(name:any){
  const PageDrawer = defineAsyncComponent(() =>import(`./components/${name}.vue`))
  resolvedComponent.value = PageDrawer
}
</script>

<template>
  <div style="width: 100%;">
    <div> 
      <el-button type="primary" @click="qh('Design')">设计器</el-button>
      <el-button type="success" @click="qh('Schema')">表单</el-button>
    </div>
    <component
      :is="resolvedComponent"
    />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>
