const alphabet = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'

const pool = {}

export default function random(length = 16) {
  let str = ''
  while (length) {
    length--
    str += alphabet[~~(Math.random() * alphabet.length)]
  }
  if (pool[str]) return random()
  pool[str] = str
  return str
}
