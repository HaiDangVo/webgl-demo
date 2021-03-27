const mimeType = {
  get '89504E47'() {
    return 'image/png'
  },
  get 47494638() {
    return 'image/gif'
  },
  get 25504446() {
    return 'application/pdf'
  },
  get FFD8FFDB() {
    return 'image/jpeg'
  },
  get FFD8FFE0() {
    return 'image/jpeg'
  },
  get FFD8FFE1() {
    return 'image/jpeg'
  },
  get FFD8FFE2() {
    return 'image/jpeg'
  },
  get '504B0304'() {
    return 'application/zip'
  },
}

export default class ImageValidation {
  constructor(el, callback, error) {
    this.el = el
    this.el.addEventListener('change', (e) => {
      const file = e.target.files[0]
      this.readFile(file, callback, error)
    })
  }

  readFile(file, callback, error) {
    const filereader = new FileReader()
    const reader = new FileReader()

    const blob = file.slice(0, 4)
    filereader.readAsArrayBuffer(blob)

    filereader.onloadend = (evt) => {
      if (evt.target.readyState === FileReader.DONE) {
        const uint = new Uint8Array(evt.target.result)
        const bytes = []

        for (let i = 0; i < uint.length; i++) {
          bytes.push(uint[i].toString(16))
        }
        const hex = bytes.join('').toUpperCase()

        if (this.getMimetype(hex) === 'image/jpeg' || this.getMimetype(hex) === 'image/png') {
          if (file) {
            reader.readAsDataURL(file)
          }
        } else if (error && typeof error === 'function') {
          error('Not a valid image.')
          // reset value
          this.el && (this.el.value = '')
        }
      }
    }

    reader.addEventListener('load', () => {
      if (callback && typeof callback === 'function') {
        callback(reader.result)
        // reset value
        this.el && (this.el.value = '')
      }
    }, false)
  }

  getMimetype(signature) {
    return mimeType[signature] || 'Unknown filetype'
  }
}
