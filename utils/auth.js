const PERMISSIONS = {
  admin: ['goods:create', 'goods:read', 'goods:update', 'goods:delete',
    'category:create', 'category:read', 'category:update', 'category:delete',
    'record:read', 'record:delete', 'scan:use', 'user:manage'],
  operator: ['goods:create', 'goods:read', 'goods:update',
    'category:read', 'record:read', 'record:create', 'scan:use'],
  viewer: ['goods:read', 'category:read', 'record:read']
}

const checkPermission = (role, action) => {
  if (!role || !PERMISSIONS[role]) return false
  return PERMISSIONS[role].includes(action)
}

const getRoleName = (role) => {
  const names = {
    admin: '管理员',
    operator: '操作员',
    viewer: '查看者'
  }
  return names[role] || '未知'
}

const getAvailableRoles = () => {
  return [
    { value: 'admin', label: '管理员', desc: '拥有所有权限' },
    { value: 'operator', label: '操作员', desc: '可管理货物和扫码入库' },
    { value: 'viewer', label: '查看者', desc: '仅可查看数据' }
  ]
}

const requireLogin = () => {
  const app = getApp()
  if (!app.globalData.isLoggedIn) {
    wx.showModal({
      title: '提示',
      content: '请先登录后再操作',
      showCancel: false,
      success() {
        wx.switchTab({ url: '/pages/index/index' })
      }
    })
    return false
  }
  return true
}

const requirePermission = (action) => {
  const app = getApp()
  if (!requireLogin()) return false

  if (!checkPermission(app.globalData.userInfo.role, action)) {
    wx.showToast({
      title: '权限不足',
      icon: 'none'
    })
    return false
  }
  return true
}

module.exports = {
  checkPermission,
  getRoleName,
  getAvailableRoles,
  requireLogin,
  requirePermission
}