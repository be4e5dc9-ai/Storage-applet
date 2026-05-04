const api = require('../../../utils/api')
const util = require('../../../utils/util')
const auth = require('../../../utils/auth')

Page({
  data: {
    isEdit: false,
    goodsId: '',
    form: {
      name: '',
      barcode: '',
      categoryId: '',
      categoryName: '',
      price: '',
      stock: 0,
      minStock: 5,
      unit: '件',
      spec: '',
      description: ''
    },
    errors: {},
    categories: [],
    categoryIndex: 0,
    submitting: false
  },

  onLoad(options) {
    this.loadCategories()
    if (options.id) {
      this.setData({ isEdit: true, goodsId: options.id })
      wx.setNavigationBarTitle({ title: '编辑货物' })
      this.loadGoodsData(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '新增货物' })
    }
  },

  loadCategories() {
    const categories = api.getCategories()
    this.setData({ categories })
  },

  loadGoodsData(id) {
    const goods = api.getGoodsById(id)
    if (!goods) {
      util.showToast('货物不存在')
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const categoryIndex = this.data.categories.findIndex(c => c.id === goods.categoryId)

    this.setData({
      form: {
        name: goods.name || '',
        barcode: goods.barcode || '',
        categoryId: goods.categoryId || '',
        categoryName: goods.categoryName || '',
        price: goods.price ? String(goods.price) : '',
        stock: goods.stock || 0,
        minStock: goods.minStock || 5,
        unit: goods.unit || '件',
        spec: goods.spec || '',
        description: goods.description || ''
      },
      categoryIndex: categoryIndex >= 0 ? categoryIndex : 0
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value,
      [`errors.${field}`]: ''
    })
  },

  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    if (category) {
      this.setData({
        categoryIndex: index,
        'form.categoryId': category.id,
        'form.categoryName': category.name
      })
    }
  },

  adjustStock(e) {
    const amount = Number(e.currentTarget.dataset.amount)
    let stock = Number(this.data.form.stock) + amount
    if (stock < 0) stock = 0
    this.setData({ 'form.stock': stock })
  },

  scanBarcode() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        this.setData({ 'form.barcode': res.result })
        const existing = api.getGoodsByBarcode(res.result)
        if (existing && !this.data.isEdit) {
          util.showModal('提示', `该条码已关联货物"${existing.name}"，是否编辑该货物？`).then(confirm => {
            if (confirm) {
              wx.redirectTo({ url: `/pages/goods/form/form?id=${existing.id}` })
            }
          })
        }
      },
      fail: () => {
        util.showToast('扫码取消')
      }
    })
  },

  validate() {
    const { form } = this.data
    const errors = {}

    if (!form.name.trim()) {
      errors.name = '请输入货物名称'
    }

    if (form.price && isNaN(Number(form.price))) {
      errors.price = '请输入有效的价格'
    }

    if (form.stock && (isNaN(Number(form.stock)) || Number(form.stock) < 0)) {
      errors.stock = '请输入有效的库存数量'
    }

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  onSubmit() {
    if (this.data.submitting) return
    if (!this.validate()) return

    this.setData({ submitting: true })

    try {
      const { form, isEdit, goodsId } = this.data
      const data = {
        name: form.name.trim(),
        barcode: form.barcode.trim(),
        categoryId: form.categoryId,
        categoryName: form.categoryName,
        price: form.price ? Number(form.price) : 0,
        stock: Number(form.stock) || 0,
        minStock: Number(form.minStock) || 5,
        unit: form.unit || '件',
        spec: form.spec.trim(),
        description: form.description.trim()
      }

      if (isEdit) {
        api.updateGoods(goodsId, data)
        util.showToast('修改成功', 'success')
      } else {
        api.createGoods(data)
        util.showToast('添加成功', 'success')
      }

      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } catch (e) {
      util.showToast('操作失败，请重试')
    } finally {
      this.setData({ submitting: false })
    }
  }
})