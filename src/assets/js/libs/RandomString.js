const alphabet = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'

export default function random(length = 16) {
  let str = ''
  while (length) {
    length--
    str += alphabet[~~(Math.random() * alphabet.length)]
  }
  return str
}
