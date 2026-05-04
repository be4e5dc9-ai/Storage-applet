const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`
}

const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const throttle = (fn, delay = 300) => {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

const showToast = (title, icon = 'none', duration = 1500) => {
  wx.showToast({ title, icon, duration })
}

const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true })
}

const hideLoading = () => {
  wx.hideLoading()
}

const showModal = (title, content, showCancel = true) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      showCancel,
      success(res) {
        resolve(res.confirm)
      }
    })
  })
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const deepClone = obj => {
  if (obj === null || typeof obj !== 'object') return obj
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    return obj
  }
}

const isEmpty = value => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

const validateNumber = (value, min = 0, max = Infinity) => {
  const num = Number(value)
  if (isNaN(num)) return false
  if (num < min || num > max) return false
  return true
}

const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

const getTimeAgo = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return Math.floor(diff / minute) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < 30 * day) return Math.floor(diff / day) + '天前'
  return formatDate(new Date(timestamp))
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  generateId,
  debounce,
  throttle,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  sleep,
  deepClone,
  isEmpty,
  validateNumber,
  formatPrice,
  getTimeAgo
}