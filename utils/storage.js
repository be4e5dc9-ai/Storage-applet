const STORAGE_PREFIX = 'gm_'
const CACHE_EXPIRE = 24 * 60 * 60 * 1000

const set = (key, value, expire = CACHE_EXPIRE) => {
  try {
    const data = {
      value,
      timestamp: Date.now(),
      expire
    }
    wx.setStorageSync(STORAGE_PREFIX + key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('存储失败:', key, e)
    return false
  }
}

const get = (key, defaultValue = null) => {
  try {
    const raw = wx.getStorageSync(STORAGE_PREFIX + key)
    if (!raw) return defaultValue

    const data = JSON.parse(raw)
    if (data.expire && Date.now() - data.timestamp > data.expire) {
      remove(key)
      return defaultValue
    }
    return data.value
  } catch (e) {
    console.error('读取失败:', key, e)
    return defaultValue
  }
}

const remove = (key) => {
  try {
    wx.removeStorageSync(STORAGE_PREFIX + key)
    return true
  } catch (e) {
    console.error('删除失败:', key, e)
    return false
  }
}

const clear = () => {
  try {
    const res = wx.getStorageInfoSync()
    res.keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        wx.removeStorageSync(key)
      }
    })
    return true
  } catch (e) {
    console.error('清空失败:', e)
    return false
  }
}

const getStorageInfo = () => {
  try {
    const res = wx.getStorageInfoSync()
    const keys = res.keys.filter(k => k.startsWith(STORAGE_PREFIX))
    return {
      keys: keys.map(k => k.replace(STORAGE_PREFIX, '')),
      currentSize: res.currentSize,
      limitSize: res.limitSize
    }
  } catch (e) {
    return { keys: [], currentSize: 0, limitSize: 0 }
  }
}

const listAll = (prefix = '') => {
  try {
    const res = wx.getStorageInfoSync()
    const results = []
    res.keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX + prefix)) {
        const value = get(key.replace(STORAGE_PREFIX, ''))
        if (value !== null) {
          results.push(value)
        }
      }
    })
    return results
  } catch (e) {
    return []
  }
}

module.exports = {
  set,
  get,
  remove,
  clear,
  getStorageInfo,
  listAll
}