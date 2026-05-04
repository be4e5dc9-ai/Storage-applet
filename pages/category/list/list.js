const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    categories: [],
    loading: false
  },

  onLoad() {
    this.loadCategories()
  },

  onShow() {
    this.loadCategories()
  },

  onPullDownRefresh() {
    this.loadCategories()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 800)
  },

  loadCategories() {
    this.setData({ loading: true })
    try {
      const categories = api.getCategories()
      const goods = api.getGoods({ pageSize: 1000 })
      
      const categoriesWithCount = categories.map(cat => ({
        ...cat,
        goodsCount: goods.list.filter(g => g.categoryId === cat.id).length
      }))

      this.setData({
        categories: categoriesWithCount,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      util.showToast('加载失败')
    }
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/category/form/form' })
  },

  goToEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/category/form/form?id=${id}` })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/category/form/form?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    
    util.showModal('确认删除', `确定要删除分类"${name}"吗？`).then(confirm => {
      if (confirm) {
        const result = api.deleteCategory(id)
        if (result.success) {
          util.showToast('删除成功', 'success')
          this.loadCategories()
        } else {
          util.showToast(result.message || '删除失败')
        }
      }
    })
  }
})