import { forEach } from "lodash";
import { showToast } from "vant";
import "vant/es/toast/style";
import saveAs from "file-saver";

import {
  useMain
} from "stores";

// 上传文件（批量）
function uploadFiles(ls = [], url = "/new_up_files") {
  const {
    fileHead
  } = useMain();
  const list = [], beforeFiles = [], nowList = [];
  ls.forEach((item) => {
    const it = {
      ...item,
      $randomId: Math.random() * 1000000
    }
    if (item.file) {
      nowList.push(it);
    } else {
      beforeFiles.push(it);
    }
    list.push(it);
  })
  return new Promise((resolve, reject) => {
    if (!nowList.length) {
      resolve(beforeFiles)
      return
    }
    $uploadFile({
      url, 
      data: nowList.map((item) => {
        return {
          ...item,
          name: "files",
          value: item.file
        }
      })
    })
      .then((res) => {
        // console.log(11, res)
        const { flag, data, message } = res;
        if(flag === false) {
          reject(message);
          return;
        }
        const backList = (data || []).map((netFileInfo, index) => {
          return {
            $randomId: nowList[index].$randomId,
            ...netFileInfo
          }
        })
        const result = list.map((item) => {
          const it = backList.find(({$randomId}) => {
            return $randomId === item.$randomId;
          })
          const {
            file,
            ...other
          } = item;
          const {name, size, type} = file || item;
          const obj = $cloneDeep({...other, name, size, type});
          if (it) {
            obj.originalUrl = it.fileUrl;
            obj.url = `${fileHead}${it.fileUrl}`;
            obj.name = it.fileName;
          }
          delete obj.$randomId;
          return obj;
        })
        resolve(result);
        //   this.$loading.close()
      })
      .catch(() => {
        // console.log(22)
        // window.$toast(`图片上传失败`)
        //   this.$loading.close()
        reject()
      })
  })
}

// 导出Excel方法
function exportExcel(params, url, name = "Excel表格") {
  const mainStore = useMain();
  return new Promise((resolve, reject) => {
    if (!mainStore.isPc) {
      window.$toast("请使用电脑端钉钉进行文档导出");
      setTimeout(() => {
        resolve();
      }, 1000)
      return;
    }
    $post({
      url,
      data: params,
      responseType: "blob"
    })
      .then((res) => {
        saveAs(res, `${name}.xlsx`);
        resolve();
      })
      .catch(() => {
        reject("获取资源失败");
      })
  })
}

//根据部门部门code获取岗位列表
function getPositionByDepartmentCode(departmentCode, valueKey = "id") {
  return new Promise((resolve, reject) => {
    $get({
      url: "/get_department_position",
      params: { departmentCode }
    }).then((res) => {
      if (!Array.isArray(res)) {
        reject("获取岗位列表失败");
        return;
      }
      resolve(res.map(item => {
        return {
          ...item,
          label: item.positionName,
          text: item.positionName,
          value: item[valueKey]
        }
      }));
    }).catch(() => {
      reject("获取部门列表失败");
    })
  })
}

//根据部门code获取部门信息
function getDepartmentByCode(departmentCode, valueKey = "absoluteId", needSelf = false) {
  return new Promise((resolve, reject) => {
    $get({
      url: "/find_delievery_department_bycode",
      params: { departmentCode }
    }).then(({ flag, message, data }) => {
      if (!flag) {
        reject(message);
        return;
      }
      const fn = (list) => {
        list.forEach((item) => {
          item.text = item.shortName || item.departmentName;
          item.value = item[valueKey];
          item.label = item.label || item.text;
          if (item.subOrgDepartments?.length) {
            item.children = [
              {
                label: `${item.text}(全部)`,
                shortName: "/",
                [valueKey]: item.value
              },
              ...item.subOrgDepartments,
            ];
            fn(item.children);
          }
        })
        return list;
      }
      resolve(needSelf ? fn([data]) : fn(data.subOrgDepartments || []));
    }).catch(() => {
      reject("获取部门列表失败");
    })
  })
}

//根据部门id获取部门信息
function getDepartmentById(id, valueKey = "absoluteId") {
  return new Promise((resolve, reject) => {
    $get({
      url: "/find_delievery_department_byid",
      params: { id }
    }).then(({ flag, message, data = [] }) => {
      if (!flag) {
        reject(message);
        return;
      }
      const fn = (list) => {
        list.forEach((item) => {
          item.text = item.shortName || item.departmentName;
            item.value = item[valueKey];
            item.label = item.label || item.text;
          if (item.subOrgDepartments?.length) {
            
            item.children = [
              {
                label: `${item.text}(全部)`,
                shortName: "/",
                [valueKey]: item.value
              },
              ...item.subOrgDepartments,
            ];
            fn(item.children);
          }
        })
        return list;
      }
      resolve(fn([data]));
    }).catch(() => {
      reject("获取部门列表失败");
    })
  })
}

//获取所有部门
function getAllDepartments(valueKey = "absoluteId") {
  return new Promise((resolve, reject) => {
    $get({
      url: "/find_delievery_departments",
    }).then(({ flag, message, data = [] }) => {
      if (!flag) {
        reject(message);
        return;
      }
      if (!data?.length) {
        resolve([]);
        return;
      }
      const fn = (list) => {
        list.forEach((item) => {
          item.text = item.shortName || item.departmentName;
          item.value = item[valueKey];
          item.label = item.label || item.text;
          if (item.subOrgDepartments?.length) {
            item.children = [
              {
                label: `${item.text}(全部)`,
                shortName: "/",
                [valueKey]: item.value
              },
              ...item.subOrgDepartments,
            ];
            fn(item.children);
          }
        })
        return list;
      }
      const newList = fn(data);
      const theAllObj = {
        text: "全部",
        label: "全部",
        value: newList.reduce((acc, cur) => {
          return acc + `${cur.value},`;
        }, "").replace(/,$/, "")
      }
      console.log(1122, theAllObj)
      resolve([theAllObj, ...newList]);
    }).catch(() => {
      reject("获取部门列表失败");
    })
  })
}

//获取所有快递公司
function getAllExpress() {
  return $get({
    url: "/get_companys",
  }).then(list => list.map(item => {
    return {
      ...item,
      text: item.name,
      value: item.code
    }
  }))
}
export {
  getDepartmentById,
  getAllDepartments,
  getAllExpress,
  exportExcel,
  getDepartmentByCode,
  getPositionByDepartmentCode,
  uploadFiles
}