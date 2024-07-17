import { getDic, getData } from "../api/index.js"

export function getFieldData(schema: any, model: any) {
  if (Array.isArray(schema)) {
    for (let key = 0; key < schema.length; key++) {
      getFieldSource(schema[key], model)
    }
  } else {
    getFieldSource(schema, model)
  }
}

function getFieldSource(property: any, model: any) {
  // 数据集来源
  if (property.source) {
    let source = property.source
    if (typeof property.source !== "object") {
      source = {
        http: property.source,
        resPath: property.resPath,
        labelKey: property.labelKey,
        valueKey: property.valueKey
      }
    }
    // 替换
    const keys = Object.keys(model)
    keys.forEach((k) => {
      const reple = "${" + k + "}"
      if (source.resPath.indexOf(reple) !== -1) {
        source.resPath = source.resPath.replace("${" + k + "}", model[k])
      }
    })
    // 字典
    if (source.http === "dic") {
      // 读取缓存
      const value = getDic(source.resPath)
      if (value) {
        property["enum"] = value.map((e: any) => {
          return {
            label: e.label,
            value: e.value
          }
        })
      }
    } else if (source.http === "data") {
      const filterModule = property.widget
      const params = urlParamsToJson(source.resPath)
      // 获取数据集对应数据
      getData(params).then((res: any) => {
        let data: any = res
        if (!Array.isArray(data)) {
          data = [data]
        }
        // 树
        if (filterModule == "cascader") {
          // 设置值
          property["enum"] = getParentData(data, source.labelKey, source.valueKey)
        } else {
          // 设置值
          property["enum"] = data.map((e: any) => {
            return {
              label: e[source.labelKey],
              value: e[source.valueKey]
            }
          })
        }
      })
    }
  }
}

// 将url参数转对象
export function urlParamsToJson(url: string) {
  const paramsSplit = url.split("?")
  if (paramsSplit.length === 1) {
    return {}
  }

  const paramsArr = paramsSplit[1].split("&")
  const jsonObj: any = {}
  for (let i = 0; i < paramsArr.length; i++) {
    const param = paramsArr[i].split("=")
    const key = decodeURIComponent(param[0])
    const value = decodeURIComponent(param[1] || "")
    jsonObj[key] = value
  }
  return jsonObj
}

function getParentData(data: any, label: string, value: any) {
  const idMap: any = {}
  const rootItems = new Set()

  // 构建 id 到父节点的映射关系
  data.forEach((item: any) => {
    const { [label]: nodeLabel, [value]: nodeValue, p_id, ...rest } = item
    idMap[nodeValue] = { label: nodeLabel, value: nodeValue, ...rest, children: [] }
    if (p_id && idMap[p_id]) {
      idMap[p_id].children.push(idMap[nodeValue])
    } else {
      rootItems.add(idMap[nodeValue])
    }
  })

  // 递归转换节点格式
  const transformNode = ({ label, value, children }: any) => ({
    label,
    value,
    ...(children.length > 0 && { children: children.map(transformNode) })
  })

  // 转换根节点格式
  const transformedRootItems = Array.from(rootItems).map(transformNode)

  return transformedRootItems
}
