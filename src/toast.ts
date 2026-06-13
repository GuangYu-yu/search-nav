type ToastType = 'success' | 'error' | 'info'

function showToast(message: string, type: ToastType = 'info', duration: number = 2500): void {
  const container = document.getElementById('toastContainer')
  if (!container) return

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message

  container.appendChild(toast)

  // 触发重排以启动过渡动画
  requestAnimationFrame(() => {
    toast.classList.add('show')
  })

  setTimeout(() => {
    toast.classList.remove('show')
    let removed = false
    const cleanup = () => {
      if (!removed) {
        removed = true
        toast.remove()
      }
    }
    toast.addEventListener('transitionend', cleanup)
    // 兜底移除（transitionend 可能不触发）
    setTimeout(cleanup, 400)
  }, duration)
}

export { showToast }