const storage = require('./utils/storage')
const auth = require('./utils/auth')

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    networkType: 'unknown',
    syncQueue: []
  },

  onLaunch() {
    this.checkNetworkStatus()
    this.initUserData()
    this.initDefaultCategories()
    this.processSyncQueue()
  },

  checkNetworkStatus() {
    const self = this
    wx.getNetworkType({
      success(res) {
        self.globalData.networkType = res.networkType
      }
    })
    wx.onNetworkStatusChange(function (res) {
      self.globalData.networkType = res.networkType ? 'connected' : 'none'
      if (res.isConnected) {
        self.processSyncQueue()
      }
    })
  },

  initUserData() {
    const userInfo = storage.get('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },

  login(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.isLoggedIn = true
    storage.set('userInfo', userInfo)
  },

  logout() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    storage.remove('userInfo')
  },

  checkPermission(action) {
    if (!this.globalData.isLoggedIn) {
      return false
    }
    return auth.checkPermission(this.globalData.userInfo.role, action)
  },

  initDefaultCategories() {
    const categories = storage.get('categories')
    if (!categories || categories.length === 0) {
      const defaults = [
        { id: 'cat_1', name: '电子产品', icon: '📱', sort: 1 },
        { id: 'cat_2', name: '食品饮料', icon: '🍜', sort: 2 },
        { id: 'cat_3', name: '办公用品', icon: '📎', sort: 3 },
        { id: 'cat_4', name: '日用百货', icon: '🏠', sort: 4 },
        { id: 'cat_5', name: '服装鞋帽', icon: '👕', sort: 5 },
        { id: 'cat_6', name: '五金工具', icon: '🔧', sort: 6 }
      ]
      storage.set('categories', defaults)
    }
  },

  addToSyncQueue(operation) {
    const queue = storage.get('syncQueue') || []
    queue.push({
      ...operation,
      timestamp: Date.now(),
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    })
    storage.set('syncQueue', queue)
  },

  processSyncQueue() {
    const queue = storage.get('syncQueue') || []
    if (queue.length === 0 || this.globalData.networkType === 'none') {
      return
    }
    const processed = []
    queue.forEach(item => {
      try {
        processed.push(item.id)
      } catch (e) {
        console.error('同步失败:', e)
      }
    })
    if (processed.length > 0) {
      const remaining = queue.filter(item => !processed.includes(item.id))
      storage.set('syncQueue', remaining)
    }
  }
})