<template>
  <!--选择器表单-->
  <el-dialog v-model="dialogVisible" :title="propsTitle" :draggable="true" :align-center="true" @closed="closeDialog">
    <template #default>
      <el-table :data="dataList" style="width: 100%" @current-change="handleCurrentChange" @selection-change="handleCurrentChange">
        <el-table-column v-if="hasTree == 'T'" type="selection" width="55" />
        <el-table-column prop="form_id" label="ID" width="180" />
        <el-table-column prop="form_code" label="编码" width="180" />
        <el-table-column prop="form_name" label="名称" />
      </el-table>
    </template>
    <template #footer>
      <div style="text-align: center">
        <el-button type="primary" @click="selectRow()">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from "vue"
// 定义接收的 props
const props: any = defineProps(["hasTree", "multiple", "propsParmas", "dataCode", "propsTitle"])
const dialogVisible = ref(true)
const dataList = ref([{
    "form_id": 1,
    "form_code": "sys_dic",
    "form_name": "字典组"
}, {
    "form_id": 2,
    "form_code": "sys_dic_item",
    "form_name": "字典"
}])
const currentRow = ref()

// 选择事件
const handleCurrentChange = (val: any) => {
  currentRow.value = val
}


// 以下是触发父组件的方法
const emit = defineEmits(["closeDialog", "confirmItem"])
// 确认选择
function selectRow() {
  // 回调传值
  emit("confirmItem", props.propsParmas, currentRow.value) 
}
function closeDialog() {
  emit("closeDialog")
}

</script>