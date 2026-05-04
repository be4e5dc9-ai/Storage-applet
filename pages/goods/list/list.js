const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    keyword: '',
    currentCategory: '',
    statusIndex: 0,
    statusOptions: [
      { value: '', label: '全部状态' },
      { value: 'active', label: '在售' },
      { value: 'inactive', label: '停用' }
    ],
    categories: [],
    goodsList: [],
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadCategories()
  },

  onShow() {
    this.refreshList()
  },

  onPullDownRefresh() {
    this.refreshList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 800)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  loadCategories() {
    const categories = api.getCategories()
    this.setData({ categories })
  },

  refreshList() {
    this.setData({ page: 1, hasMore: true, goodsList: [] })
    this.loadGoods()
  },

  loadGoods() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const status = this.data.statusOptions[this.data.statusIndex].value
      const result = api.getGoods({
        keyword: this.data.keyword,
        categoryId: this.data.currentCategory,
        status,
        page: this.data.page,
        pageSize: this.data.pageSize
      })

      const list = result.list.map(item => ({
        ...item,
        updateTimeStr: util.formatTime(new Date(item.updatedAt))
      }))

      this.setData({
        goodsList: this.data.page === 1 ? list : [...this.data.goodsList, ...list],
        total: result.total,
        hasMore: this.data.goodsList.length + list.length < result.total,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      util.showToast('加载失败')
    }
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 })
    this.loadGoods()
  },

  onSearchInput: util.debounce(function (e) {
    this.setData({ keyword: e.detail.value })
    this.refreshList()
  }, 500),

  doSearch() {
    this.refreshList()
  },

  clearSearch() {
    this.setData({ keyword: '' })
    this.refreshList()
  },

  filterByCategory(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ currentCategory: id })
    this.refreshList()
  },

  onStatusChange(e) {
    this.setData({ statusIndex: e.detail.value })
    this.refreshList()
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/goods/detail/detail?id=${id}` })
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/goods/form/form' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/goods/form/form?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    util.showModal('确认删除', `确定要删除货物"${name}"吗？删除后不可恢复。`).then(confirm => {
      if (confirm) {
        api.deleteGoods(id)
        util.showToast('删除成功', 'success')
        this.refreshList()
      }
    })
  },

  preventBubble() {}
})