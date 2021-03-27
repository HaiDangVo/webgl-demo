const isMobile = () => /Mobi|Android/i.test(navigator.userAgent)

const DeThrottler = options => {
  const delay = options.delay || 200
  let nextValid = Date.now() + delay
  let callback = 0;
  (options.target || window).addEventListener(options.event, e => {
    clearTimeout(callback)
    const timeStamp = Date.now()
    if (timeStamp > nextValid) {
      options.callback(e)
      nextValid = timeStamp + delay
      return
    }
    callback = setTimeout(() => {
      if (!options.skipLastCall) {
        options.callback(e)
      }
    }, delay)
  })
}

export {
  isMobile,
  DeThrottler
}
