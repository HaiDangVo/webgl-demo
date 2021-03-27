const Animator = () => {
  let timestamp = Date.now()
  let running = false
  const subs = []
  const looper = () => {
    const newTime = Date.now()
    const delta = (newTime - timestamp) / 1000 * 60
    timestamp = newTime
    subs.forEach((s, i) => {
      s.delta += delta
      if (s.delta >= s.baseDeltaFps) {
        s.delta = s.delta - s.baseDeltaFps
        if (!s.callback(delta)) {
          subs.splice(i, 1)
          s.onComplete && s.onComplete()
        }
      }
    })
    if (subs.length) {
      requestAnimationFrame(looper)
      return
    }
    running = false
  }
  const addToLoop = animate => {
    subs.push(animate)
    if (running) return
    running = true
    timestamp = Date.now()
    requestAnimationFrame(looper)
  }
  return (callback = delta => delta || false, options = {
    onStart: null,
    onComplete: null,
    fps: 60
  }) => {
    const newAnimate = {
      callback,
      onComplete: options.onComplete,
      fps: ~~options.fps || 60,
      delta: 0
    }
    newAnimate.baseDeltaFps = 60 / newAnimate.fps
    addToLoop(newAnimate)
    options.onStart && options.onStart()
  }
}

export default Animator()
