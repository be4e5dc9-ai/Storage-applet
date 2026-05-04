const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    loading: true,
    goods: null,
    goodsId: '',
    createTimeStr: '',
    updateTimeStr: '',
    recentRecords: [],
    showModal: false,
    modalType: 'in',
    modalQuantity: 1,
    modalRemark: '',
    modalSubmitting: false,
    previewStock: 0
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ goodsId: options.id })
      this.loadGoodsData()
    } else {
      this.setData({ loading: false })
    }
  },

  onShow() {
    if (this.data.goodsId) {
      this.loadGoodsData()
    }
  },

  loadGoodsData() {
    const goods = api.getGoodsById(this.data.goodsId)
    if (goods) {
      const records = api.getRecords({ goodsId: this.data.goodsId })
      const recentRecords = records.list.slice(0, 5).map(r => ({
        ...r,
        timeStr: util.formatTime(new Date(r.createdAt))
      }))

      this.setData({
        goods,
        loading: false,
        createTimeStr: util.formatTime(new Date(goods.createdAt)),
        updateTimeStr: util.formatTime(new Date(goods.updatedAt)),
        recentRecords
      })
    } else {
      this.setData({ goods: null, loading: false })
    }
  },

  showStockModal(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      showModal: true,
      modalType: type,
      modalQuantity: 1,
      modalRemark: '',
      previewStock: type === 'in' 
        ? this.data.goods.stock + 1 
        : this.data.goods.stock - 1
    })
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  preventBubble() {},

  onQtyInput(e) {
    const qty = Number(e.detail.value) || 0
    const { goods, modalType } = this.data
    const previewStock = modalType === 'in' 
      ? goods.stock + qty 
      : goods.stock - qty
    this.setData({ modalQuantity: qty, previewStock })
  },

  adjustQty(e) {
    const amount = Number(e.currentTarget.dataset.amount)
    let qty = this.data.modalQuantity + amount
    if (qty < 0) qty = 0
    const { goods, modalType } = this.data
    const previewStock = modalType === 'in' 
      ? goods.stock + qty 
      : goods.stock - qty
    this.setData({ modalQuantity: qty, previewStock })
  },

  setQuickQty(e) {
    const qty = Number(e.currentTarget.dataset.qty)
    const { goods, modalType } = this.data
    const previewStock = modalType === 'in' 
      ? goods.stock + qty 
      : goods.stock - qty
    this.setData({ modalQuantity: qty, previewStock })
  },

  onRemarkInput(e) {
    this.setData({ modalRemark: e.detail.value })
  },

  confirmStockOp() {
    const { goods, modalType, modalQuantity, modalRemark } = this.data
    
    if (!modalQuantity || modalQuantity <= 0) {
      util.showToast('请输入有效的数量')
      return
    }

    if (modalType === 'out' && modalQuantity > goods.stock) {
      util.showToast('出库数量不能超过库存')
      return
    }

    this.setData({ modalSubmitting: true })

    try {
      let result
      if (modalType === 'in') {
        result = api.stockIn(goods.id, modalQuantity, modalRemark, goods.barcode)
      } else {
        result = api.stockOut(goods.id, modalQuantity, modalRemark)
      }

      if (result.success) {
        util.showToast(modalType === 'in' ? '入库成功' : '出库成功', 'success')
        this.hideModal()
        this.loadGoodsData()
      } else {
        util.showToast(result.message || '操作失败')
      }
    } catch (e) {
      util.showToast('操作失败，请重试')
    } finally {
      this.setData({ modalSubmitting: false })
    }
  },

  onEdit() {
    wx.navigateTo({ url: `/pages/goods/form/form?id=${this.data.goodsId}` })
  },

  onDelete() {
    util.showModal('确认删除', `确定要删除货物"${this.data.goods.name}"吗？删除后不可恢复。`).then(confirm => {
      if (confirm) {
        api.deleteGoods(this.data.goodsId)
        util.showToast('删除成功', 'success')
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      }
    })
  },

  goToAllRecords() {
    wx.navigateTo({ url: `/pages/record/list/list?goodsId=${this.data.goodsId}` })
  },

  goBack() {
    wx.navigateBack()
  }
})