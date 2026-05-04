const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    loading: true,
    recordId: '',
    record: null,
    timeStr: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recordId: options.id })
      this.loadRecordData(options.id)
    } else {
      this.setData({ loading: false })
    }
  },

  loadRecordData(id) {
    const record = api.getRecordById(id)
    if (record) {
      this.setData({
        record,
        loading: false,
        timeStr: util.formatTime(new Date(record.createdAt))
      })
    } else {
      this.setData({ record: null, loading: false })
    }
  },

  goToGoods() {
    if (this.data.record && this.data.record.goodsId) {
      wx.navigateTo({
        url: `/pages/goods/detail/detail?id=${this.data.record.goodsId}`
      })
    }
  },

  goToRecords() {
    wx.navigateBack()
  },

  goBack() {
    wx.navigateBack()
  }
})