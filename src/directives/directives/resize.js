// directives/resize.js


// 定义自定义指令v-resize
const resize = {
  name: "resize",
  // 指令绑定到元素时触发（DOM已挂载）
  mounted(el, binding) {
    // el：指令绑定的原生DOM元素
    // binding.value：指令传递的回调函数（尺寸变化时执行）
    if (typeof binding.value !== 'function') {
      throw new Error('v-resize 指令必须传递一个回调函数！')
    }

    // 创建ResizeObserver实例
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      // 执行外部传递的回调，返回最新尺寸（已取整）
      binding.value({
        width: Math.round(width),
        height: Math.round(height)
      })
    })

    // 开始监听
    resizeObserver.observe(el)

    // 关键：将实例挂载到DOM元素上，方便解绑时获取
    el._resizeObserver = resizeObserver
  },

  // 指令从元素上解绑时触发（组件卸载/元素移除）
  unmounted(el) {
    // 获取挂载在元素上的监听实例
    const resizeObserver = el._resizeObserver
    if (resizeObserver) {
      resizeObserver.unobserve(el)
      resizeObserver.disconnect()
      // 清除挂载的属性，避免内存泄漏
      delete el._resizeObserver
    }
  }
}

export default resize