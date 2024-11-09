// 在此处导入拦截的请求响应
const body = JSON.parse($response.body); // 获取响应体
const originalRequest = JSON.parse($request.body); // 获取原始请求体
// 原始经纬度
const originalLat = 39.888073;
const originalLng = 116.350838;
const radius = 50;
const crypto = require('crypto');

function getMd5(s) {
    const hash = crypto.createHash('md5');
    hash.update(s, 'utf-8');
    return hash.digest('hex');
}

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
        lat: newLat.toSting(),
        lng: newLng.toSting()
    };
}

if (!body.result.success) {
    // 如果响应 result 为 false，则重新生成随机坐标
    const accuracy = "0";
    const newCoords = getRandomPointInRadius(originalLat, originalLng, radius);
    // 获取当前时间戳（毫秒）
    const timestamp = Math.round(Date.now());
    const hash = getMd5(newCoords.lat + newCoords.lng + accuracy + timestamp.toString() + "hcm cloud")
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
    }).then(newResponse = >{
        $done({
            body: newResponse.body
        }); // 返回新响应
    }).
    catch(err = >{
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
