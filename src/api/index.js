/*
 * @Date: 2023-09-20 14:06:59
 * @LastEditors: dawud_yang 472077692@qq.com
 * @LastEditTime: 2023-09-20 14:06:59
 */

import http from "../utils/axios"
const baseUrl = import.meta.env.BASE_URL

/**
 * 获取表单JSON
 * @param {*} data
 * @returns
 */
export function getForm(data) {
  return http.get(`${baseUrl}form.json`, { params: data })
}

/**
 * 获取字典
 * @param {*} data
 * @returns
 */
export function getDic(data) {
  return http.get(`${baseUrl}dic.json`, { params: data })
}

/**
 * 获取数据
 * @param {*} data
 * @returns
 */
export function getData(data) {
  console.log(data)
  // 我这里只是演示写死先
  let id=""
  if(data.id){
    id = data.id
  }
  return http.get(`${baseUrl}data${id}.json`)
}