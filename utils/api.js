const storage = require('./storage')
const util = require('./util')

const API_BASE = 'https://api.example.com'

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    const app = getApp()
    if (app.globalData.networkType === 'none') {
      reject({ code: -1, message: '网络未连接，请检查网络设置' })
      return
    }

    wx.request({
      url: API_BASE + url,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      timeout: 10000,
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject({ code: res.statusCode, message: '请求失败' })
        }
      },
      fail(err) {
        reject({ code: -1, message: '网络请求失败', error: err })
      }
    })
  })
}

const getGoods = (params = {}) => {
  let goods = storage.get('goods') || []

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    goods = goods.filter(g =>
      g.name.toLowerCase().includes(kw) ||
      g.barcode?.toLowerCase().includes(kw) ||
      g.description?.toLowerCase().includes(kw)
    )
  }

  if (params.categoryId) {
    goods = goods.filter(g => g.categoryId === params.categoryId)
  }

  if (params.status !== undefined && params.status !== '') {
    goods = goods.filter(g => g.status === params.status)
  }

  goods.sort((a, b) => b.updatedAt - a.updatedAt)

  const total = goods.length
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const list = goods.slice(start, start + pageSize)

  return { list, total, page, pageSize }
}

const getGoodsById = (id) => {
  const goods = storage.get('goods') || []
  return goods.find(g => g.id === id) || null
}

const getGoodsByBarcode = (barcode) => {
  const goods = storage.get('goods') || []
  return goods.find(g => g.barcode === barcode) || null
}

const createGoods = (data) => {
  const goods = storage.get('goods') || []
  const item = {
    id: util.generateId('goods'),
    ...data,
    stock: data.stock || 0,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  goods.push(item)
  storage.set('goods', goods)
  return item
}

const updateGoods = (id, data) => {
  const goods = storage.get('goods') || []
  const index = goods.findIndex(g => g.id === id)
  if (index === -1) return null

  goods[index] = {
    ...goods[index],
    ...data,
    updatedAt: Date.now()
  }
  storage.set('goods', goods)
  return goods[index]
}

const deleteGoods = (id) => {
  let goods = storage.get('goods') || []
  goods = goods.filter(g => g.id !== id)
  storage.set('goods', goods)
  return true
}

const getCategories = () => {
  return storage.get('categories') || []
}

const createCategory = (data) => {
  const categories = storage.get('categories') || []
  const item = {
    id: util.generateId('cat'),
    ...data,
    sort: categories.length + 1
  }
  categories.push(item)
  storage.set('categories', categories)
  return item
}

const updateCategory = (id, data) => {
  const categories = storage.get('categories') || []
  const index = categories.findIndex(c => c.id === id)
  if (index === -1) return null
  categories[index] = { ...categories[index], ...data }
  storage.set('categories', categories)
  return categories[index]
}

const deleteCategory = (id) => {
  let categories = storage.get('categories') || []
  const goods = storage.get('goods') || []
  const hasGoods = goods.some(g => g.categoryId === id)
  if (hasGoods) {
    return { success: false, message: '该分类下还有货物，请先移除' }
  }
  categories = categories.filter(c => c.id !== id)
  storage.set('categories', categories)
  return { success: true }
}

const createRecord = (data) => {
  const records = storage.get('records') || []
  const item = {
    id: util.generateId('rec'),
    ...data,
    createdAt: Date.now()
  }
  records.push(item)
  storage.set('records', records)
  return item
}

const getRecords = (params = {}) => {
  let records = storage.get('records') || []

  if (params.type) {
    records = records.filter(r => r.type === params.type)
  }

  if (params.goodsId) {
    records = records.filter(r => r.goodsId === params.goodsId)
  }

  if (params.startDate) {
    records = records.filter(r => r.createdAt >= params.startDate)
  }

  if (params.endDate) {
    records = records.filter(r => r.createdAt <= params.endDate)
  }

  records.sort((a, b) => b.createdAt - a.createdAt)

  const total = records.length
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const list = records.slice(start, start + pageSize)

  return { list, total, page, pageSize }
}

const getRecordById = (id) => {
  const records = storage.get('records') || []
  return records.find(r => r.id === id) || null
}

const getDashboardStats = () => {
  const goods = storage.get('goods') || []
  const records = storage.get('records') || []
  const categories = storage.get('categories') || []

  const activeGoods = goods.filter(g => g.status === 'active')
  const totalStock = activeGoods.reduce((sum, g) => sum + (g.stock || 0), 0)
  const lowStockGoods = activeGoods.filter(g => g.stock <= (g.minStock || 5))
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayRecords = records.filter(r => r.createdAt >= todayStart.getTime())
  const todayIn = todayRecords.filter(r => r.type === 'in')
  const todayInCount = todayIn.reduce((sum, r) => sum + r.quantity, 0)

  return {
    totalGoods: activeGoods.length,
    totalStock,
    totalCategories: categories.length,
    lowStockCount: lowStockGoods.length,
    todayInCount,
    todayRecordCount: todayRecords.length,
    lowStockGoods: lowStockGoods.slice(0, 5),
    recentRecords: records.slice(0, 5)
  }
}

const stockIn = (goodsId, quantity, remark = '', barcode = '') => {
  const goods = storage.get('goods') || []
  const index = goods.findIndex(g => g.id === goodsId)
  if (index === -1) {
    return { success: false, message: '货物不存在' }
  }

  goods[index].stock = (goods[index].stock || 0) + quantity
  goods[index].updatedAt = Date.now()
  storage.set('goods', goods)

  const record = createRecord({
    type: 'in',
    goodsId,
    goodsName: goods[index].name,
    barcode: barcode || goods[index].barcode,
    quantity,
    beforeStock: goods[index].stock - quantity,
    afterStock: goods[index].stock,
    remark,
    operator: getApp().globalData.userInfo?.name || '未知'
  })

  return { success: true, record, newStock: goods[index].stock }
}

const stockOut = (goodsId, quantity, remark = '') => {
  const goods = storage.get('goods') || []
  const index = goods.findIndex(g => g.id === goodsId)
  if (index === -1) {
    return { success: false, message: '货物不存在' }
  }
  if (goods[index].stock < quantity) {
    return { success: false, message: '库存不足' }
  }

  goods[index].stock -= quantity
  goods[index].updatedAt = Date.now()
  storage.set('goods', goods)

  const record = createRecord({
    type: 'out',
    goodsId,
    goodsName: goods[index].name,
    barcode: goods[index].barcode,
    quantity,
    beforeStock: goods[index].stock + quantity,
    afterStock: goods[index].stock,
    remark,
    operator: getApp().globalData.userInfo?.name || '未知'
  })

  return { success: true, record, newStock: goods[index].stock }
}

module.exports = {
  request,
  getGoods,
  getGoodsById,
  getGoodsByBarcode,
  createGoods,
  updateGoods,
  deleteGoods,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createRecord,
  getRecords,
  getRecordById,
  getDashboardStats,
  stockIn,
  stockOut
}