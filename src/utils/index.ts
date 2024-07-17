import { type App } from "vue"
import SvgIcon from "./../components/SvgIcon/index.vue" // Svg Component
import * as svg from "@element-plus/icons-vue"

/**
 * 导出全局注册 element plus svg 图标
 * @param app vue 实例
 * @description 使用：https://element-plus.gitee.io/zh-CN/component/icon.html
 */
export function loadSvg(app: App) {
  const icons = svg as any
  for (const i in icons) {
    app.component(`ele-${icons[i].name}`, icons[i])
  }
  app.component("SvgIcon", SvgIcon)
}
