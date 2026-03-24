<script setup name="BbFilesPicker">
import {
  computed,
  ref,
} from "vue";
import {
  uploadFiles
} from "apis/common"
import {
  useMain
} from "stores";

const {
  fileHead
} = useMain();
const props = defineProps({
  modelValue: {},
  readonly: {
    type: Boolean,
    default: false
  },
  placeholder: {},
  name: {},
  rules: {
    type: Array,
    default: () => new Array()
  },
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ""
  },
  required: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxCount: {
    default: Infinity,
  },
  accept: {
    type: String,
    default: '*'
  },
  capture: {
    type: String,
  },
  maxSize: { //单位：KB
    default: Infinity
  },
})
const uploader = ref(null);
const emits = defineEmits(["onDone", "update:modelValue"]);
const fileList = computed({
  get() {
    const list = props.modelValue || [];
    return list.map((item) => {
      let obj = {};
      if(typeof item === "string") {
        const suffix = item?.split('.').pop();
        obj = {
          originalUrl: item,
          url: `${fileHead}${item}`,
          name: item?.split('/').pop(),
          suffix,
          type: window.$getFileType(suffix)
        }
      } else {
        const suffix = item?.url?.split('.').pop();
        obj = {
          name: item?.url?.split('/').pop(),
          originalUrl: item?.url,
          suffix,
          ...item,
          type: window.$getFileType(suffix),
        }
      }
      return {
        ...obj,
        $randomId: item.$randomId || (Math.random() * 1000000).toString()
      }
    });
  },
  set(val) {
    emits("update:modelValue", val);
  }
})
function uploadNow() {
  emits("update:modelValue");
}
defineExpose({ uploadNow });

function toPick() {
  if(props.disabled || props.readonly || (fileList.value.length >= props.maxCount)) return;
  uploader.value?.click?.();
}

function handleChange({target}) {
  
  const num = props.maxCount - fileList.value.length;
  if(num <= 0) {
    this.showToast('最多上传' + props.maxCount + '个文件');
    return;
  }
  let delNum = 0;
  const ls = Array.from(target.files).slice(0, num);
  const list = ls.filter(({size}) => {
    const isOverSize = size > props.maxSize * 1024;
    if(isOverSize) {
      delNum++;
    }
    return !isOverSize;
  });
  if(delNum > 0) {
    this.showToast('文件过大，已自动过滤' + delNum + '个文件');
  }
  $loading.open();
  uploadFiles(list.map(fileItem => ({file: fileItem}))).then(resList => {
    fileList.value = [...fileList.value, ...resList];
    // console.log(999, resList)
  }).catch((msg) => {
    $toast(msg || "上传失败");
  }).finally(() => {
    $loading.close();
  })
  // fileList.value = [...fileList.value, ...list.slice(0, num).map(item => ({file: item}))];
  // this.$nextTick(() => {
  //   console.log(this.fileList)
  // })
  target.value = null;
}


function imagePreview($randomId) {
  // console.log(fileList.value)
  let pIndex = 0;
  const list = fileList.value.filter(({type, url}) => {
    return type === "image";
  }).map(({url, $randomId: randomId}, index) => {
    if($randomId === randomId) {
      pIndex = index;
    }
    return url;
  });
  showImagePreview({
    images: list,
    startPosition: pIndex,
  })
  // console.log(pIndex, list)
}

// 删除文件
function deleteFile($randomId) {
  fileList.value = fileList.value.filter(({ $randomId: id }) => {
    return id !== $randomId;
  })
}

</script>

<template>
  <div class="bb-files-picker-container">
    <van-field :name="name" :is-link="(!readonly && !disabled) && (fileList.length < maxCount)" :label="label" :required="required" readonly
      :disabled="disabled" :placeholder="fileList.length > 0 ? '' : disabled || readonly ? '' : placeholder || `请选择${label}`"
      :rules="rules.length > 0 ? rules : required ? [{ validator: () => {
        return fileList.length > 0;
      }, message: `请选择${label}` }] : []" @click="toPick">
      <template #left-icon v-if="$slots['left-icon']">
        <slot name="left-icon"></slot>
      </template>
    </van-field>
    <!-- <van-uploader ref="uploader" v-model="fileList" :multiple="multiple" :max-count="maxCount" :accept="accept"
    :max-size="maxSize * 1024" :show-upload="false">
    </van-uploader> -->
    <input class="uploader-input" ref="uploader" multiple type="file" :name="name" :accept="accept" :capture="capture" :disabled="disabled" @change="handleChange" />
    <slot name="tip">
      <div class="tip" v-if="maxCount !== Infinity">最多可上传{{ maxCount }}个文件</div>
    </slot>
    <div class="file-list-container" v-if="fileList.length > 0">
      <view class="file-line" v-for="({name, type, $randomId}, index) in fileList" :key="$randomId">
        <view class="name">{{ name }}</view>
        <van-icon v-if="type === 'image'" class="delete-btn" name="eye-o" color="#E96736" @click="imagePreview($randomId)" />
        <van-icon class="delete-btn" name="close" color="#E96736" @click="deleteFile($randomId)" />
      </view>
    </div>
  </div>


</template>

<style lang="less" scoped>
.bb-files-picker-container {
  width: 100%;
  box-sizing: border-box;
  // @flex-row-center();
  // flex-wrap: wrap;
  color: @theme-color;
  box-sizing: border-box;
  background-color: @background-white-color;
  :deep(.van-uploader) {
    display: none;
    
  }
  .tip {
    padding: 4px 18px;
    font-size: @font-size-xs;
  }
  .file-list-container {
    padding: 14px 18px 14px calc(18px + 2px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    .file-line {
      color: #666666;
      @flex-row();
      align-items: center;
      // border-bottom: 1px dashed #f1f1f1;
      & + .file-line {
        margin-top: 8px;
      }
      &.image {
        text-decoration: underline;
      }
      .name {
        flex-grow: 1;
        .ellipsis(1);
      }
      .delete-btn {
        margin-left: 4px;
      }
    }
  }
  .uploader-input {
    display: none;
  }
  // :deep(.van-field__value) {
  //   width: 100%;
  //   flex: none;
  //   margin-top: 8px;
  // }


}
</style>