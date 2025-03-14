<script setup name="BbFilesPicker">
import {
  defineExpose,
  computed,
  ref,
} from "vue";

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
      return {
        ...item,
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
  uploader.value?.chooseFile();
}

function deleteFile($randomId) {
  fileList.value = fileList.value.filter(({ $randomId: id }) => {
    return id !== $randomId;
  })
}

</script>

<template>
  <div class="bb-files-picker-container">
    <van-field :name="name" :is-link="(!readonly && !disabled) && (fileList.length < maxCount)" :label="label" :required="required" readonly
      :disabled="props.disabled" :placeholder="fileList.length > 0 ? '' : props.disabled || props.readonly ? '' : placeholder || `请选择${label}`"
      :rules="rules.length > 0 ? rules : [{ validator: () => {
        return fileList.length > 0;
      }, message: `请选择${label}` }]" @click-input="toPick">
      <template #left-icon v-if="$slots['left-icon']">
        <slot name="left-icon"></slot>
      </template>
    </van-field>
    <van-uploader ref="uploader" v-model="fileList" :multiple="multiple" :max-count="maxCount" :accept="accept"
    :max-size="maxSize * 1024" :show-upload="false">
    </van-uploader>
    <slot name="tip">
      <div class="tip" v-if="maxCount !== Infinity">最多可上传{{ maxCount }}个文件</div>
    </slot>
    <div class="file-list-container" v-if="fileList.length > 0">
      <view class="file-line" v-for="({file, name, $randomId}) in fileList" :key="$randomId">
        <view class="name">{{ name || file.name }}</view>
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
    padding: 14px 18px;
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
      .name {
        flex-grow: 1;
        .ellipsis(1);
      }
      .delete-btn {
        margin-left: 4px;
      }
    }
  }
  // :deep(.van-field__value) {
  //   width: 100%;
  //   flex: none;
  //   margin-top: 8px;
  // }


}
</style>