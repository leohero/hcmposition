// 在此处导入拦截的请求响应
const body = JSON.parse($response.body); // 获取响应体
// const originalRequest = JSON.parse($request.body); // 获取原始请求体
// 原始经纬度
const originalLat = 39.888073;
const originalLng = 116.350838;
const radius = 50;
// const crypto = require('crypto');

// function getMd5(s) {
//     const hash = crypto.createHash('md5');
//     hash.update(s, 'utf-8');
//     return hash.digest('hex');
// }

// 定义随机生成新坐标的方法
function getRandomPointInRadius(lat, lon, radius) {
    const earthRadius = 6371000; // 地球半径，单位为米
    const randomDistance = Math.sqrt(Math.random()) * radius; // 随机距离
    const randomAngle = Math.random() * 2 * Math.PI; // 随机角度
    const deltaLat = (randomDistance / earthRadius) * (180 / Math.PI);
    const deltaLon = (randomDistance / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

    const newLat = lat + deltaLat * Math.sin(randomAngle);
    const newLon = lon + deltaLon * Math.cos(randomAngle);

    return {
        lat: newLat.toString(),
        lng: newLon.toString()
    };
}

if (!body.result.success) {
    // 如果响应 result 为 false，则重新生成随机坐标
    const accuracy = "0";
    const newCoords = getRandomPointInRadius(originalLat, originalLng, radius);
    // 获取当前时间戳（毫秒）
    const timestamp = Math.round(Date.now());
    const hash = md5(newCoords.lat + newCoords.lng + accuracy + timestamp.toString() + "hcm cloud")
    // 构造新的请求体
    const newRequestBody = {
        "latitude": newCoords.lat,
        "longitude": newCoords.lng,
        "accuracy": accuracy,
        "timestamp": timestamp,
        "hash": hash
    };
    console.log(newRequestBody);

    // 重新发起请求
    $task.fetch({
        url: $request.url,
        method: $request.method,
        headers: $request.headers,
        body: JSON.stringify(newRequestBody),
    }).then(newResponse =>{
        $done({
            body: newResponse.body
        }); // 返回新响应
    }).
    catch(err =>{
        console.error('重试请求失败:', err);
        $done({
            body: JSON.stringify({
                result: false,
                error: "retry failed"
            })
        });
    });
} else {
    $done({
        body: JSON.stringify(body)
    }); // 如果 result 为 true，则直接返回响应
}


function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }

  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWordsTempOne = lMessageLength + 8;
    var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
    var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordArray[(lByteCount - (lByteCount % 4)) / 4] |= (0x80 << ((lByteCount % 4) * 8));
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue) {
    var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = "0" + lByte.toString(16);
      WordToHexValue += WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
  }

  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  string = unescape(encodeURIComponent(string));  // 处理 Unicode 字符串
  x = ConvertToWordArray(string);

  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = GG(a, b, c, d, x[k + 4], S21, 0xF57C0FAF);
    d = GG(d, a, b, c, x[k + 5], S22, 0x4787C62A);
    c = GG(c, d, a, b, x[k + 6], S23, 0xA8304613);
    b = GG(b, c, d, a, x[k + 7], S24, 0xFD469501);
    a = HH(a, b, c, d, x[k + 8], S31, 0x698098D8);
    d = HH(d, a, b, c, x[k + 9], S32, 0x8B44F7AF);
    c = HH(c, d, a, b, x[k + 10], S33, 0xFFFF5BB1);
    b = HH(b, c, d, a, x[k + 11], S34, 0x895CD7BE);
    a = II(a, b, c, d, x[k + 12], S41, 0x6B901122);
    d = II(d, a, b, c, x[k + 13], S42, 0xFD987193);
    c = II(c, d, a, b, x[k + 14], S43, 0xA679438E);
    b = II(b, c, d, a, x[k + 15], S44, 0x49B40821);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }

  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}
