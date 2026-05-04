Page({
  data: {
    generated: false,
    iconList: [
      { name: 'home.png', saved: false },
      { name: 'home-active.png', saved: false },
      { name: 'goods.png', saved: false },
      { name: 'goods-active.png', saved: false },
      { name: 'scan.png', saved: false },
      { name: 'scan-active.png', saved: false },
      { name: 'record.png', saved: false },
      { name: 'record-active.png', saved: false }
    ]
  },

  onLoad() {},

  generateIcons() {
    wx.showLoading({ title: '生成中...' })
    
    const icons = [
      { name: 'home.png', path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', color: '#999999' },
      { name: 'home-active.png', path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', color: '#1890ff' },
      { name: 'goods.png', path: 'M20 2H4c-1 0-2 1-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z', color: '#999999' },
      { name: 'goods-active.png', path: 'M20 2H4c-1 0-2 1-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z', color: '#1890ff' },
      { name: 'scan.png', path: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z', color: '#999999' },
      { name: 'scan-active.png', path: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z', color: '#1890ff' },
      { name: 'record.png', path: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', color: '#999999' },
      { name: 'record-active.png', path: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', color: '#1890ff' }
    ]

    this.drawIcons(icons)
  },

  drawIcons(icons) {
    const ctx = wx.createCanvasContext('iconCanvas', this)
    let index = 0

    const drawNext = () => {
      if (index >= icons.length) {
        wx.hideLoading()
        this.setData({ generated: true })
        wx.showToast({ title: '生成完成', icon: 'success' })
        return
      }

      const icon = icons[index]
      ctx.clearRect(0, 0, 81, 81)
      
      ctx.setFillStyle(icon.color)
      ctx.beginPath()
      
      const scale = 2.5
      const offsetX = 10
      const offsetY = 10
      
      this.drawPath(ctx, icon.path, scale, offsetX, offsetY)
      ctx.fill()
      ctx.draw(false, () => {
        setTimeout(() => {
          this.saveIcon(icon.name, index)
          index++
          drawNext()
        }, 100)
      })
    }

    drawNext()
  },

  drawPath(ctx, path, scale, offsetX, offsetY) {
    const commands = path.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g)
    let x = 0, y = 0

    commands.forEach(cmd => {
      const type = cmd[0]
      const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number)

      switch(type) {
        case 'M':
          x = nums[0] * scale + offsetX
          y = nums[1] * scale + offsetY
          ctx.moveTo(x, y)
          break
        case 'L':
          x = nums[0] * scale + offsetX
          y = nums[1] * scale + offsetY
          ctx.lineTo(x, y)
          break
        case 'H':
          x = nums[0] * scale + offsetX
          ctx.lineTo(x, y)
          break
        case 'V':
          y = nums[0] * scale + offsetY
          ctx.lineTo(x, y)
          break
        case 'C':
          ctx.bezierCurveTo(
            nums[0] * scale + offsetX, nums[1] * scale + offsetY,
            nums[2] * scale + offsetX, nums[3] * scale + offsetY,
            nums[4] * scale + offsetX, nums[5] * scale + offsetY
          )
          x = nums[4] * scale + offsetX
          y = nums[5] * scale + offsetY
          break
        case 'Z':
          ctx.closePath()
          break
      }
    })
  },

  saveIcon(fileName, index) {
    wx.canvasToTempFilePath({
      canvasId: 'iconCanvas',
      x: 0,
      y: 0,
      width: 81,
      height: 81,
      destWidth: 81,
      destHeight: 81,
      success: (res) => {
        const fs = wx.getFileSystemManager()
        const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
        
        try {
          fs.saveFile({
            tempFilePath: res.tempFilePath,
            filePath: filePath,
            success: () => {
              const iconList = this.data.iconList
              iconList[index].saved = true
              this.setData({ iconList })
              
              this.copyToProject(filePath, fileName)
            }
          })
        } catch(e) {
          console.log('保存失败:', fileName, e)
        }
      }
    }, this)
  },

  copyToProject(filePath, fileName) {
    console.log(`图标已保存: ${filePath}`)
    console.log(`请手动复制到项目 images/ 目录: images/${fileName}`)
  },

  saveAllIcons() {
    if (!this.data.generated) {
      wx.showToast({ title: '请先生成图标', icon: 'none' })
      return
    }
    
    wx.showModal({
      title: '提示',
      content: '图标已保存到本地，请在微信开发者工具中手动复制到 images/ 目录',
      showCancel: false
    })
  }
})