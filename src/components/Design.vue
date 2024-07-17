<template>
  <div style="width: 100%;">
    <FormDesign ref="formDesign" :defaultSchema="previewSchema" @formModelChange="formModelChange">
    <!--顶部插槽按钮-->
    <template #publish>
      <el-button-group>
        <el-button type="primary" icon="SuccessFilled" @click="confirm()">发布</el-button>
      </el-button-group>
    </template>
    </FormDesign>
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
import { ref } from "vue"
import { pringSchema, FormDesign } from "eform-designer"
import "eform-designer/dist/designer.style.css" //引入样式
import FilterPage from "./FilterPage.vue"
import { getForm } from "../api/index.js"
import { ElMessage } from "element-plus"
const model: any = ref(undefined)
const formDesign = ref()
const selectorVisible = ref(false)
const previewSchema: any = ref({})
// 默认表单json
previewSchema.value = {
  properties: [],
  ui: {
    labelWidth: "120px",
    labelPosition: "top",
    showMessage: true,
    size: "default"
  },
  row: {
    type: "flex",
    style: {
      flexWrap: "wrap"
    },
    gutter: 20
  },
  col: {}
}
const dialogForm = ref({
  titleName: "",
  dataCode: "",
  hasTree: false,
  multiple: false,
  paramItem: {}
})

// 表单字段改变事件
function formModelChange(item: any, models: any) {
  // 选择器
  if (item.widget == "dataSelector") {
    dialogForm.value.titleName = item.label
    dialogForm.value.dataCode = item.source.resPath
    dialogForm.value.hasTree = item.showType === "tree" ? true : false
    dialogForm.value.paramItem = item
    // 是否多选
    dialogForm.value.multiple = item.ui && item.ui.multiple ? true : false
    selectorVisible.value = true
    model.value = models
  }
  // 按钮操作
  else if(item.widget == "button"){

  }
  // 其他
  else {
    if (models == "designer_name") {
      previewSchema.value.ui.designer_name = item
    } else if (models == "designer_code") {
      previewSchema.value.ui.designer_code = item
    }
  }
}

// 关闭选择器
function closeDialog() {
  selectorVisible.value = false
}

// 选择器确认选择数据
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
    model.value[item.model] = vArr
  } else {
    model.value[item.model] = vArr[0]
  }
  handleChange(item, model.value)
  if (item.model == "group_id") {
    previewSchema.value.ui.group_id = model.value["group_id"]
  }
  selectorVisible.value = false
}

/**
 * change 事件来替换值
 */
async function handleChange(e: any, item: any) {
  // 表单来源
  if (e.model == "formSource") {
    const data: any = await getForm()
    // 这里是去获取设置好的JSON 我这里就写死
    const schemaForm = data
    const { formSchema } = pringSchema(schemaForm, {}, {})
    if (e.from == "formSource") {
      previewSchema.value = formSchema
    } else if (e.from == "subForm") {
      formDesign.value.selectProperty["model"] = data.data.formCode
      formDesign.value.selectProperty["properties"] = formSchema.properties
    } else if (e.from == "vxeTable") {
      formDesign.value.selectProperty["model"] = data.data.formCode
      formDesign.value.selectProperty["enum"] = formSchema.properties
    }
  }
}

function confirm() {
  if (
    !previewSchema.value.ui.designer_name ||
    !previewSchema.value.ui.designer_code ||
    !previewSchema.value.ui.group_id
  ) {
    ElMessage.error("表单名称，编码，分组等字段必填")
    return
  }
  // 保存入库操作 数据 previewSchema.value
}
</script>
