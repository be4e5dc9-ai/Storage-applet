const api = require('../../utils/api')
const auth = require('../../utils/auth')
const util = require('../../utils/util')

Page({
  data: {
    userInfo: { name: '访客' },
    roleName: '',
    stats: {
      totalGoods: 0,
      totalStock: 0,
      totalCategories: 0,
      lowStockCount: 0,
      todayInCount: 0,
      todayRecordCount: 0,
      lowStockGoods: [],
      recentRecords: []
    },
    showLogin: false,
    loginForm: {
      name: '',
      role: 'operator'
    },
    roles: []
  },

  onLoad() {
    this.setData({ roles: auth.getAvailableRoles() })
  },

  onShow() {
    this.loadUserInfo()
    this.loadStats()
  },

  onPullDownRefresh() {
    this.loadStats()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 800)
  },

  loadUserInfo() {
    const app = getApp()
    if (app.globalData.isLoggedIn) {
      const userInfo = app.globalData.userInfo
      this.setData({
        userInfo,
        roleName: auth.getRoleName(userInfo.role)
      })
    } else {
      this.setData({
        userInfo: { name: '访客' },
        roleName: '点击登录'
      })
    }
  },

  loadStats() {
    const stats = api.getDashboardStats()
    if (stats.recentRecords) {
      stats.recentRecords = stats.recentRecords.map(r => ({
        ...r,
        timeAgo: util.getTimeAgo(r.createdAt)
      }))
    }
    this.setData({ stats })
  },

  onUserBarTap() {
    const app = getApp()
    if (app.globalData.isLoggedIn) {
      wx.showActionSheet({
        itemList: ['切换账号', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.showLoginModal()
          } else if (res.tapIndex === 1) {
            this.doLogout()
          }
        }
      })
    } else {
      this.showLoginModal()
    }
  },

  showLoginModal() {
    const app = getApp()
    this.setData({
      showLogin: true,
      loginForm: {
        name: app.globalData.userInfo?.name || '',
        role: app.globalData.userInfo?.role || 'operator'
      }
    })
  },

  hideLogin() {
    this.setData({ showLogin: false })
  },

  preventBubble() {},

  onLoginInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`loginForm.${field}`]: e.detail.value
    })
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({ 'loginForm.role': role })
  },

  doLogin() {
    const { name, role } = this.data.loginForm
    if (!name.trim()) {
      util.showToast('请输入用户名')
      return
    }
    const app = getApp()
    app.login({
      name: name.trim(),
      role,
      loginTime: Date.now()
    })
    this.setData({ showLogin: false })
    this.loadUserInfo()
    this.loadStats()
    util.showToast('登录成功', 'success')
  },

  doLogout() {
    util.showModal('确认退出', '确定要退出登录吗？').then(confirm => {
      if (confirm) {
        const app = getApp()
        app.logout()
        this.loadUserInfo()
        util.showToast('已退出登录')
      }
    })
  },

  goToScan() {
    wx.switchTab({ url: '/pages/scan/index/index' })
  },

  goToAddGoods() {
    wx.navigateTo({ url: '/pages/goods/form/form' })
  },

  goToCategory() {
    wx.navigateTo({ url: '/pages/category/list/list' })
  },

  goToGoodsList() {
    wx.switchTab({ url: '/pages/goods/list/list' })
  },

  goToLowStock() {
    wx.switchTab({ url: '/pages/goods/list/list' })
  },

  goToRecords() {
    wx.switchTab({ url: '/pages/record/list/list' })
  },

  goToGoodsDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/goods/detail/detail?id=${id}` })
  },

  goToRecordDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/record/detail/detail?id=${id}` })
  }
})