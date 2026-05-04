const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    currentType: '',
    selectedDate: '',
    records: [],
    stats: {
      inCount: 0,
      outCount: 0,
      totalCount: 0
    },
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    goodsId: ''
  },

  onLoad(options) {
    if (options.goodsId) {
      this.setData({ goodsId: options.goodsId })
    }
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

  refreshList() {
    this.setData({ page: 1, hasMore: true, records: [] })
    this.loadRecords()
    this.loadStats()
  },

  loadRecords() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const params = {
        type: this.data.currentType,
        goodsId: this.data.goodsId,
        page: this.data.page,
        pageSize: this.data.pageSize
      }

      if (this.data.selectedDate) {
        const date = new Date(this.data.selectedDate)
        params.startDate = date.getTime()
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        params.endDate = endDate.getTime()
      }

      const result = api.getRecords(params)
      const list = result.list.map(item => ({
        ...item,
        timeStr: util.formatTime(new Date(item.createdAt))
      }))

      this.setData({
        records: this.data.page === 1 ? list : [...this.data.records, ...list],
        hasMore: this.data.records.length + list.length < result.total,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      util.showToast('加载失败')
    }
  },

  loadStats() {
    try {
      const params = { pageSize: 1000 }
      if (this.data.selectedDate) {
        const date = new Date(this.data.selectedDate)
        params.startDate = date.getTime()
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        params.endDate = endDate.getTime()
      }

      const result = api.getRecords(params)
      const inRecords = result.list.filter(r => r.type === 'in')
      const outRecords = result.list.filter(r => r.type === 'out')

      this.setData({
        stats: {
          inCount: inRecords.reduce((sum, r) => sum + r.quantity, 0),
          outCount: outRecords.reduce((sum, r) => sum + r.quantity, 0),
          totalCount: result.total
        }
      })
    } catch (e) {
      console.error('加载统计失败:', e)
    }
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 })
    this.loadRecords()
  },

  filterByType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ currentType: type })
    this.refreshList()
  },

  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value })
    this.refreshList()
  },

  clearDate() {
    this.setData({ selectedDate: '' })
    this.refreshList()
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/record/detail/detail?id=${id}` })
  }
})