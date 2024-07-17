/*
 * @Date: 2023-09-20 14:06:59
 * @LastEditors: dawud_yang 472077692@qq.com
 * @LastEditTime: 2023-09-20 14:06:59
 */
"use strict"

import axios from "axios"

const config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
}

const _axios = axios.create(config)

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response.data
  },
  function (error) {
    // Do something with response error
    return Promise.reject(error)
  }
)

export default _axios
