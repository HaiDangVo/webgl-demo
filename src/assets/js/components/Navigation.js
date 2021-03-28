const pathInstruction = {
  checkpointOS: {
    doorRL1: 'checkpointRL1',
    doorRR1: 'checkpointRR1'
  },
  checkpointRL1: {
    doorRL1: 'checkpointOS',
    doorRL2: 'checkpointRL2',
    'picRL1-1': 'checkpointRL1-1',
    'picRL1-2': 'checkpointRL1-2',
    'picRL1-3': 'checkpointRL1-3'
  },
  checkpointRL2: {
    doorRL2: 'checkpointRL1',
    'picRL2-1': 'checkpointRL2-1',
    'picRL2-2': 'checkpointRL2-2',
    'picRL2-3': 'checkpointRL2-3'
  },
  checkpointRR1: {
    doorRR1: 'checkpointOS',
    doorRR2: 'checkpointRR2',
    'picRR1-1': 'checkpointRR1-1',
    'picRR1-2': 'checkpointRR1-2'
  },
  checkpointRR2: {
    doorRR2: 'checkpointRR1',
    'picRR2-1': 'checkpointRR2-1',
    'picRR2-2': 'checkpointRR2-2',
    'picRR2-3': 'checkpointRR2-3',
    'picRR2-4': 'checkpointRR2-4'
  },
}

pathInstruction['checkpointRL1-1'] = pathInstruction.checkpointRL1
pathInstruction['checkpointRL1-2'] = pathInstruction.checkpointRL1
pathInstruction['checkpointRL1-3'] = pathInstruction.checkpointRL1
pathInstruction['checkpointRL2-1'] = pathInstruction.checkpointRL2
pathInstruction['checkpointRL2-2'] = pathInstruction.checkpointRL2
pathInstruction['checkpointRL2-3'] = pathInstruction.checkpointRL2
//
pathInstruction['checkpointRR1-1'] = pathInstruction.checkpointRR1
pathInstruction['checkpointRR1-2'] = pathInstruction.checkpointRR1
pathInstruction['checkpointRR2-1'] = pathInstruction.checkpointRR2
pathInstruction['checkpointRR2-2'] = pathInstruction.checkpointRR2
pathInstruction['checkpointRR2-3'] = pathInstruction.checkpointRR2
pathInstruction['checkpointRR2-4'] = pathInstruction.checkpointRR2

export default class Navigation {
  constructor(options) {
    this.options = options
    this.scene = options.scene
    this.currentCheckpoint = null
    this.isOutdoor = true
  }

  hideVisibleCheckpoints() {
    Object.keys(pathInstruction).forEach(key => {
      Object.keys(pathInstruction[key]).forEach(innerKey => {
        const name = pathInstruction[key][innerKey]
        const checkpoint = this.scene.getObjectByName(name)
        if (checkpoint) {
          checkpoint.visible = false
        }
      })
    })
  }

  checkIfOutdoor() {
    return !this.currentCheckpoint || this.currentCheckpoint === pathInstruction.checkpointOS
  }

  saveCheckpoint(name) {
    this.currentCheckpoint = pathInstruction[name]
    this.isOutdoor = this.currentCheckpoint === pathInstruction.checkpointOS
  }

  determineNextCheckpoint(object) {
    if (!this.currentCheckpoint) return 'checkpointOS'
    return this.currentCheckpoint[object.name]
  }

  determineLookatBaseOnCheckpoint(checkpoint) {
    if (!checkpoint) return
    const query = `pic${checkpoint.replace('checkpoint', '')}`
    return this.scene.getObjectByName(query)
  }
}
