const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    barcode: '',
    goodsId: '',
    goods: null,
    quantity: 1,
    remark: '',
    newStock: 0,
    submitting: false,
    recentRecords: []
  },

  onLoad(options) {
    const { barcode, goodsId, mode } = options
    this.setData({ barcode: barcode || '', goodsId: goodsId || '' })
    
    if (goodsId) {
      this.loadGoodsData(goodsId)
    }
  },

  onShow() {
    if (this.data.goodsId) {
      this.loadGoodsData(this.data.goodsId)
    }
  },

  loadGoodsData(id) {
    const goods = api.getGoodsById(id)
    if (goods) {
      this.setData({
        goods,
        newStock: goods.stock + this.data.quantity
      })
    }
  },

  onQtyInput(e) {
    const quantity = Number(e.detail.value) || 0
    const newStock = this.data.goods ? this.data.goods.stock + quantity : quantity
    this.setData({ quantity, newStock })
  },

  adjustQty(e) {
    const amount = Number(e.currentTarget.dataset.amount)
    let quantity = this.data.quantity + amount
    if (quantity < 0) quantity = 0
    const newStock = this.data.goods ? this.data.goods.stock + quantity : quantity
    this.setData({ quantity, newStock })
  },

  setQuickQty(e) {
    const quantity = Number(e.currentTarget.dataset.qty)
    const newStock = this.data.goods ? this.data.goods.stock + quantity : quantity
    this.setData({ quantity, newStock })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  onSubmit() {
    const { goods, quantity, remark, barcode } = this.data

    if (!goods) {
      util.showToast('货物信息异常')
      return
    }

    if (!quantity || quantity <= 0) {
      util.showToast('请输入有效的入库数量')
      return
    }

    this.setData({ submitting: true })

    try {
      const result = api.stockIn(goods.id, quantity, remark, barcode)

      if (result.success) {
        util.showToast('入库成功', 'success')
        
        const recentRecords = this.data.recentRecords.concat([{
          id: result.record.id,
          quantity,
          timeStr: util.formatTime(new Date())
        }])

        this.setData({
          submitting: false,
          goods: api.getGoodsById(goods.id),
          quantity: 1,
          remark: '',
          recentRecords,
          newStock: api.getGoodsById(goods.id).stock
        })
      } else {
        util.showToast(result.message || '入库失败')
        this.setData({ submitting: false })
      }
    } catch (e) {
      util.showToast('操作失败，请重试')
      this.setData({ submitting: false })
    }
  },

  createNewGoods() {
    wx.redirectTo({
      url: `/pages/goods/form/form?barcode=${this.data.barcode}`
    })
  },

  goBack() {
    wx.navigateBack()
  }
})