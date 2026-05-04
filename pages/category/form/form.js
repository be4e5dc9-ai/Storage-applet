const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    isEdit: false,
    categoryId: '',
    form: {
      name: '',
      icon: '📦',
      sort: '',
      description: ''
    },
    errors: {},
    showIcons: false,
    submitting: false,
    iconList: [
      '📦', '📱', '💻', '🖥️', '🖨️', '📷', '🎮', '🎧',
      '🍜', '🍕', '🍔', '🥤', '🍎', '🥛', '🍞', '🍰',
      '📎', '✏️', '📚', '📝', '📁', '🗂️', '📊', '📈',
      '🏠', '🛋️', '🚿', '💡', '🧹', '🧴', '🧸', '🎁',
      '👕', '👗', '👖', '👟', '🧢', '👓', '👜', '💍',
      '🔧', '🔨', '🔩', '⚙️', '🔌', '🔋', '💡', '🔨',
      '⚽', '🏀', '🎾', '🏐', '🎱', '🏓', '🏸', '🥊',
      '🚗', '🚌', '🚲', '✈️', '🚢', '🚀', '🛸', '🎈'
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, categoryId: options.id })
      wx.setNavigationBarTitle({ title: '编辑分类' })
      this.loadCategoryData(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '新增分类' })
    }
  },

  loadCategoryData(id) {
    const categories = api.getCategories()
    const category = categories.find(c => c.id === id)
    
    if (!category) {
      util.showToast('分类不存在')
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({
      form: {
        name: category.name || '',
        icon: category.icon || '📦',
        sort: category.sort ? String(category.sort) : '',
        description: category.description || ''
      }
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value,
      [`errors.${field}`]: ''
    })
  },

  showIconPicker() {
    this.setData({ showIcons: !this.data.showIcons })
  },

  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon
    this.setData({
      'form.icon': icon,
      showIcons: false
    })
  },

  validate() {
    const { form } = this.data
    const errors = {}

    if (!form.name.trim()) {
      errors.name = '请输入分类名称'
    }

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  onSubmit() {
    if (this.data.submitting) return
    if (!this.validate()) return

    this.setData({ submitting: true })

    try {
      const { form, isEdit, categoryId } = this.data
      const data = {
        name: form.name.trim(),
        icon: form.icon || '📦',
        sort: form.sort ? Number(form.sort) : 99,
        description: form.description.trim()
      }

      if (isEdit) {
        api.updateCategory(categoryId, data)
        util.showToast('修改成功', 'success')
      } else {
        api.createCategory(data)
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