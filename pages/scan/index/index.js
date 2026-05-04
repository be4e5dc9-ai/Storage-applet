const api = require('../../../utils/api')
const util = require('../../../utils/util')
const storage = require('../../../utils/storage')

Page({
  data: {
    barcode: '',
    recentScans: [],
    scanStats: {
      total: 0,
      matched: 0,
      unmatched: 0
    }
  },

  onLoad() {
    this.loadRecentScans()
    this.loadScanStats()
  },

  onShow() {
    this.loadRecentScans()
    this.loadScanStats()
  },

  loadRecentScans() {
    const recentScans = storage.get('recentScans') || []
    const formatted = recentScans.slice(0, 10).map(item => ({
      ...item,
      timeStr: util.formatTime(new Date(item.timestamp))
    }))
    this.setData({ recentScans: formatted })
  },

  loadScanStats() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayTimestamp = todayStart.getTime()
    
    const allScans = storage.get('recentScans') || []
    const todayScans = allScans.filter(s => s.timestamp >= todayTimestamp)
    
    this.setData({
      scanStats: {
        total: todayScans.length,
        matched: todayScans.filter(s => s.goodsId).length,
        unmatched: todayScans.filter(s => !s.goodsId).length
      }
    })
  },

  startScan() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      success: (res) => {
        this.handleScanResult(res.result)
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          util.showToast('扫码取消')
        } else {
          util.showToast('扫码失败，请重试')
        }
      }
    })
  },

  onBarcodeInput(e) {
    this.setData({ barcode: e.detail.value })
  },

  onManualSubmit() {
    const barcode = this.data.barcode.trim()
    if (!barcode) {
      util.showToast('请输入条码内容')
      return
    }
    this.handleScanResult(barcode)
  },

  handleScanResult(barcode) {
    const goods = api.getGoodsByBarcode(barcode)
    
    this.saveRecentScan(barcode, goods)

    if (goods) {
      wx.navigateTo({
        url: `/pages/scan/result/result?barcode=${barcode}&goodsId=${goods.id}&mode=existing`
      })
    } else {
      wx.showModal({
        title: '未找到货物',
        content: `条码 "${barcode}" 未关联任何货物，是否新增货物？`,
        confirmText: '新增货物',
        cancelText: '取消',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: `/pages/goods/form/form?barcode=${barcode}`
            })
          }
        }
      })
    }
  },

  saveRecentScan(barcode, goods) {
    let recentScans = storage.get('recentScans') || []
    recentScans = recentScans.filter(s => s.barcode !== barcode)
    recentScans.unshift({
      barcode,
      goodsId: goods ? goods.id : null,
      goodsName: goods ? goods.name : '',
      timestamp: Date.now()
    })
    recentScans = recentScans.slice(0, 50)
    storage.set('recentScans', recentScans)
  },

  onRecentTap(e) {
    const barcode = e.currentTarget.dataset.barcode
    this.setData({ barcode })
    this.handleScanResult(barcode)
  },

  clearRecent() {
    util.showModal('确认清空', '确定要清空最近扫码记录吗？').then(confirm => {
      if (confirm) {
        storage.set('recentScans', [])
        this.setData({ recentScans: [] })
        util.showToast('已清空')
      }
    })
  }
})