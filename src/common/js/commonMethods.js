// import {
//     device
// } from 'dingtalk-jsapi';

// import { post } from "apis/axios";
import { storeToRefs } from 'pinia';
import { useMain } from 'stores';
import qs from "qs";
// const store = storeToRefs(useMain());

function decodeUri(url) {
    const newStr = decodeURIComponent(url);
    if(url === newStr) {
        return newStr;
    }
    return decodeUri(newStr)
}

//获取base64字符串解码后大小
function getDecodedSizeFromBase64(base64) {
    if (!base64 || !base64.includes(',')) {
        throw new Error('请传入正确的base64字符串');
    }
    const decodedString = atob(base64.split(',')[1]);
    const decodedBytes = decodedString.length;
    return decodedBytes;
}

//压缩图片（因只有jpeg图片支持调整质量，所以只输出jpeg格式图片）
function compressImg(imgFile, maxSize) {
    maxSize = maxSize * 1024;
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.src = imgFile;
        // 允许跨域访问图片资源，以便在canvas中使用img.src加载并绘制图片
        img.crossOrigin = "Anonymous";
        img.onload = function () {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var width = img.width;
            var height = img.height;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            var quality = 1;
            let newBase64Image, resultBlob, latestSize;
            do {
                newBase64Image = canvas.toDataURL("image/jpeg", quality);
                resultBlob = base64ToBlob(newBase64Image);
                if(resultBlob.size <= maxSize) {
                    console.log(`当前quality为${quality},最终大小为${resultBlob.size / 1000}kb`);
                    break;
                } else {
                    if(!latestSize || latestSize > resultBlob.size) {
                        latestSize = resultBlob.size;
                        quality = Number((quality - 0.1).toFixed(1));
                    } else {
                        console.log(`当前quality为${quality},无法压缩到${maxSize}kb，最终大小为${resultBlob.size / 1000}kb`);
                        break;
                    }
                }
            } while (quality > 0.1);
            resolve(resultBlob);
        };
        img.onerror = reject;
    })
}
//base64转blob
function base64ToBlob(base64) {
    var arr = base64.split(",");
    // 检查arr的长度和格式
    if (arr.length < 2) {
        throw new Error("无效的base64格式：缺少','分隔符。");
    }

    var mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error("无效的base64格式：缺少MIME类型。");
    }
    
    var mime = mimeMatch[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], {
        type: mime
    });
}
// 判断是否PC端
function isPC() {
  try {
    // 静态定义设备标识符数组
    const Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod", "HarmonyOS"];
    const userAgentInfo = navigator?.userAgent || '';

    // 使用正则表达式进行匹配，提高效率
    const agentRegex = new RegExp(Agents.join('|'), 'i');
    return !agentRegex.test(userAgentInfo);
  } catch (error) {
    console.error('Error detecting device type:', error);
    return false; // 默认返回false，表示未知设备类型
  }
}


// 图片上传
// function uploadFiles(list) {
//     const beforeImgs = list
//       .filter((item) => {
//         return !item.file
//       })
//       .map((item) => {
//         return {
//           url: item['url'],
//           relativeUrl: item["relativeUrl"] ? item["relativeUrl"] : item['url'],
//         }
//       })
//     // console.log(beforeImgs, list)
//     return new Promise((resolve, reject) => {
//       const newList = list.filter((item) => {
//         return item.file
//       })
//       if (!newList.length) {
//         resolve(beforeImgs)
//         return
//       }
//       let fileList = new FormData()
//       for (let item of newList) {
//         fileList.append('files', item.file, item.file.name)
//       }
//       const url = `${store.getters.fileUploadHead}/up_files`
//     //   this.$loading.open()
//       post(url, fileList, false, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }, false)
//         .then((res) => {
//           // console.log(333, res)
//           const imgs = res['data'].map((item) => {
//             return {
//               url: `${store.getters.fileHead}${item}`,
//               relativeUrl: item
//             }
//           })
//           resolve([...beforeImgs, ...imgs])
//         //   this.$loading.close() 
//         })
//         .catch(() => {
//         //   this.$toast(`图片上传失败`)
//         //   this.$loading.close()
//           reject()
//         })
//     })
//   }

function strToArr(str) {
    if(str === "" || str === null || str === undefined) {
        return [];
    }
    return str.split(",");
}

function arrToStr(arr) {
    if(!Array.isArray(arr) || !arr.length) return ""
    let str = ""
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] == null) continue
        str += (i ? ',' : '') + arr[i]
    }
    return str
}




function getPath() {
    const pathRE = /#\/?([^?]*)/.exec(window.location.href);
    return (pathRE && pathRE[1]) || "/";
}

function getUrlParam({key, url = window.location.href} = {}) {
    const searchParams = new URLSearchParams(url.split('?')[1]);
    return key == null ? Object.fromEntries(searchParams) : searchParams.get(key);
}

function getIsWxClient () {
    return /micromessenger/i.test(navigator.userAgent);
}

// function getRunningEnv() {
//     const {env} = require("dingtalk-jsapi");
//     if(env.platform !== "notInDingTalk") {
//         return 2;
//     }
//     if(getIsWxClient()) {
//         return 1;
//     }
//     return 0;
// }



// 根据客户信息获取对应位置
function getPointsDistance(fromPos, {
    city,
    cusName,
    lng,
    lat
}) {
    // cusName = "丰硕路"
    return new Promise((resolve, reject) => {
        if(lng != null && lng != undefined && lat != null && lat != undefined) {
            var dis = window.$AMap.GeometryUtil.distance([fromPos.lng, fromPos.lat], [lng, lat]);
            resolve({
                distance: (dis).toFixed(2),
                lng,
                lat
            })
            return;
        }

        var placeSearch = new window.$AMap.PlaceSearch({
            // city 指定搜索所在城市，支持传入格式有：城市名、citycode和adcode
            city: city || '全国'
        });
        placeSearch.search(cusName, (status, result) => {
            // 查询成功时，result即对应匹配的POI信息
            // console.log(status, result)
            if (status == "complete") {
                if (!result["poiList"]["pois"].length) {
                    resolve({
                        distance: null,
                        lat: null,
                        lng: null
                    });
                    return;
                }
                const p = result["poiList"]["pois"][0]["location"];
                const pointPos = {
                    lat: p["lat"],
                    lng: p["lng"]
                }
                const dis = window.$AMap.GeometryUtil.distance([fromPos.lng, fromPos.lat], [pointPos.lng, pointPos.lat]);
                resolve({
                    distance: (dis).toFixed(2),
                    ...pointPos
                })
            } else {
                resolve({
                    distance: null,
                    lat: null,
                    lng: null
                })
            }

        }, () => {
            reject(null)
        });
    })
}

function openMapApp({
    lng,
    lat,
    name,
    content,
    useBaidu
}) {
    // console.log(lng,lat,name,useBaidu)
    const isiOS = window.$AMap.Browser.ios; //是否ios终端     
    const gaodeIosUrl = lng && lat ? `iosamap://viewMap?sourceApplication=businessAssistant&poiname=${name}&lat=${lat}&lon=${lng}&dev=1` : `iosamap://poi?sourceApplication=businessAssistant&name=${name}&&dev=1`;
    const gaodeAndroidUrl = lng && lat ? `androidamap://viewMap?sourceApplication=businessAssistant&poiname=${name}&lat=${lat}&lon=${lng}&dev=1` : `androidamap://poi?sourceApplication=businessAssistant&keywords=${name}`;
    const baiduIosUrl = lng && lat ? `baidumap://map/marker?location=${lat},${lng}&title=${name}&content=${content}&src=ios.baidu.openAPIdemo` : `baidumap://map/place/search?query=${name}&src=ios.homa.businessAssistant`;
    const baiduAndroidUrl = lng && lat ? `bdapp://map/marker?location=${lat},${lng}&title=${name}&content=${content}&traffic=on&src=andr.baidu.openAPIdemo` : `bdapp://map/place/search?query=${name}&src=andr.homa.businessAssistant`
    if (isiOS) {
        if(!useBaidu) {
            window.location.href = gaodeIosUrl;  
        } else {
            window.location.href = baiduIosUrl;           
        }
    } else {
        if(!useBaidu) {
            window.location.href = gaodeAndroidUrl;
            
        } else {
            window.location.href = baiduAndroidUrl;
            
        }
    }
    
}





// function h5GetLocation() {
//     return new Promise((resolve, reject) => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition((p) => {
//                 resolve({
//                     lat: p.coords.latitude,
//                     lng: p.coords.longitude
//                 });
//             }, (e) => {
//                 reject(e)
//             });
//         } else {
//             reject()
//         }
//     })
// }

// function ddGetLocation() {
//     return new Promise((resolve, reject) => {
//         device.geolocation.get({
//             targetAccuracy: 200,
//             coordinate: 1,
//             withReGeocode: true,
//             useCache: true, //默认是true，如果需要频繁获取地理位置，请设置false
//             onSuccess: function (result) {
//                 // console.log(result)
//                 resolve({
//                     lat: result.latitude,
//                     lng: result.longitude
//                 })
//             },
//             onFail: function () {
//                 reject()
//             }
//         }).catch(() => {
//             reject()
//         });
//     })
// }
export {
    openMapApp,
    getPointsDistance,
    getUrlParam,
    getIsWxClient,
    getPath,
    // getRunningEnv,
    strToArr,
    arrToStr,
    // uploadFiles,
    isPC,
    compressImg,
    getDecodedSizeFromBase64,
    decodeUri,
    // getFileUrl
}