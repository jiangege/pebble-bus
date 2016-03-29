require! {
  "./components/crypto-js": CryptoJS
}

keyHex = CryptoJS.enc.Utf8.parse "woqunimalegebi1234567890"
encrypted = CryptoJS.TripleDES.encrypt "" + Date.now(), keyHex, {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
}

console.log encrypted.toString!
