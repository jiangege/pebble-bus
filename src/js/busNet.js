var CryptoJS, ajax, BusNet;
CryptoJS = require('./components/crypto-js');
ajax = require('ajax');
BusNet = {
  url: "http://api.chelaile.net.cn:7000",
  cryptoSign: function(key){
    var keyHex, encrypted;
    keyHex = CryptoJS.enc.Utf8.parse(key || this.key);
    encrypted = CryptoJS.TripleDES.encrypt("" + Date.now(), keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  },
  request: function(method, path, params){
    return ajax({
      url: this.url + path,
      data: params,
      method: method || 'get',
      type: 'text',
      cache: false,
      headers: {
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 5.1; m2 note Build/LMY47D)",
        "Host": "api.chelaile.net.cn:7000",
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip"
      }
    }, function(data, status, request){
      return console.log(data);
    }, function(error, status, request){
      return console.log(error);
    });
  }
};
module.exports = BusNet;