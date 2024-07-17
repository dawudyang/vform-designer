<template>
  <div class="form-item">
    <SchemaForm
    v-if="previewSchema"
      ref="schemaFormRef"
      :model="previewModel"
      v-model:schema="previewSchema"
      :rules="previewRules"
      @getFieldData="getFiledSource"
      @change="formModelChange"
    >
      <slot name="footer" />
    </SchemaForm>
    <!--自定义弹窗 选择器控件的自定义-->
    <FilterPage
      v-if="selectorVisible"
      :propsTitle="dialogForm.titleName"
      :dataCode="dialogForm.dataCode"
      :hasTree="dialogForm.hasTree"
      :multiple="dialogForm.multiple"
      :propsParmas="dialogForm.paramItem"
      @closeDialog="closeDialog"
      @confirmItem="confirmItem"
    />
  </div>
</template>
<script setup lang="ts">
import { pringSchema, SchemaForm } from "eform-designer"
import "eform-designer/dist/designer.style.css" //引入样式
import FilterPage from "./FilterPage.vue"
import { getFieldData, urlParamsToJson } from "../utils/form.ts"
import { getForm } from "../api/index.js"
import { ref, nextTick } from "vue"
import { ElMessage } from "element-plus"
import axios from 'axios'
const schemaFormRef = ref()
const selectorVisible = ref(false)
const dialogForm = ref({
  titleName: "",
  dataCode: "",
  hasTree: false,
  multiple: false,
  paramItem: {}
})
const formJson = ref({})
const previewRules: any = ref({})
const previewModel: any = ref({})
const previewSchema: any = ref(null)
const setModel: any = ref(undefined)
load()
async function  load() {
  // 获取表单JSON
  const data: any = await getForm()
  formJson.value = data
  const { formSchema, formModel, formRules } = pringSchema(data, {}, {})
  previewSchema.value = formSchema
  previewModel.value = formModel
  previewRules.value = formRules
}

const submitForm = async () => {
  let formData = null
  await schemaFormRef.value.validate((valid: any) => {
    if (valid) {
      // 保存更新
      formData = previewModel.value
    } else {
      ElMessage.error("未通过校验")
    }
  })
  return formData
}

function getFiledSource(e: any, item: any) {
  getFieldData(e, item)
}

// 表单字段改变事件
async function formModelChange(item: any, models: any) {
  // 选择器
  if (item.widget == "dataSelector") {
    dialogForm.value.titleName = item.label
    dialogForm.value.dataCode = item.source.resPath
    dialogForm.value.hasTree = item.showType === "tree" ? true : false
    dialogForm.value.paramItem = item
    // 是否多选
    dialogForm.value.multiple = item.ui && item.ui.multiple ? true : false
    selectorVisible.value = true
    setModel.value = models
  }else if(item.widget == "button"){
    // 按钮事件
    if (item.buttonAction == "drawer") {
      // 可以设置弹窗
      selectorVisible.value = true
    } else if (item.buttonAction == "newPage") {
      let url = item.buttonScript
      if (url.indexOf("http") == -1) {
        url = `${window.location.origin}/#/` + url
      }
      const keys = Object.keys(models)
      keys.map((item) => {
        url = url.replace("${" + item + "}", models[item])
      })
      window.open(url, "_blank")
    } else if (item.buttonAction == "save") {
      // 可以写保存入库操作
    } else if (item.buttonAction == "api") {
      // 调用接口
      let url = item.buttonScript
      if (url.indexOf("http") == -1) {
        url = `${window.location.origin}/#/` + url
      }
      const keys = Object.keys(models)
      keys.map((item) => {
        url = url.replace("${" + item + "}", models[item])
      })
      const params = urlParamsToJson(url)
      const code = url.split("?")[0] 
      try {
        const res = await axios.post(code, params) // 发送 POST 请求
        ElMessage.info(JSON.stringify(res))
      } catch (error: any) {
        // 错误处理...
        ElMessage.error(error.message)
      }
    }
  }else {
    // 字符串替换空为逗号
    if (models && !Array.isArray(previewModel.value[models])) {
      const regex = /\s+/g // 匹配连续的空白字符
      previewModel.value[models] = previewModel.value[models].replace(regex, ",")
    }
    // 设置字段联动
    replaceJson(models, previewModel.value)
  }
}

// 联动更新参数中的变量 变量为${id} id为字段
function replaceJson(item: any, models: any) {
  // 替换
  const schema = JSON.parse(JSON.stringify(formJson.value))
  const str = JSON.stringify(schema)
  const keys = Object.keys(models)
  keys.forEach((item) => {
    const reple = "${" + item + "}"
    if (str.indexOf(reple) !== -1) {
      previewSchema.value = JSON.parse(str.replace("${" + item + "}", models[item]))
    }
  })
}

// 关闭选择器
function closeDialog() {
  selectorVisible.value = false
}

//确认选择数据
function confirmItem(item: any, values: any) {
  if (!Array.isArray(values)) {
    values = [values]
  }
  const datas: any = []
  const vArr: any = []
  values.forEach((val: any) => {
    const col = {
      label: val[item.source.labelKey],
      value: val[item.source.valueKey]
    }
    datas.push(col)
    vArr.push(val[item.source.valueKey])
  })
  item.enum = datas
  if (item.ui && item.ui.multiple) {
    // 数组
    setModel.value[item.model] = vArr
  } else {
    setModel.value[item.model] = vArr[0]
  }
  selectorVisible.value = false
  replaceJson(item, setModel.value)
}

// 清楚校验
function clearValidate() {
  nextTick(() => {
    if (schemaFormRef.value) {
      schemaFormRef.value.clearValidate()
    }
  })
}

// 使用 defineExpose 声明需要暴露给父组件的属性和方法
defineExpose({
  clearValidate,
  previewModel,
  submitForm
})
</script>

<style scoped>
.form-item {
  padding-right: 10px;
  height: 100%;
  overflow-y: auto;
}
:deep(.el-dialog__header) {
  height: 32px;
}
:deep(.el-tabs) {
  --el-tabs-header-height: 32px;
}
.el-button--medium {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
  width: 140px;
}
.el-button--primary {
  background: #fff200;
  border: 1px solid #fff200;
  color: #333;
}
.el-button--clear {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}
</style>
