<template>
  <div class="BbImagesPicker" :style="pickerStyle">
    <div class="BbImagesPicker-grid">
      <div
        v-for="(item, index) in fileList"
        :key="item.url || index"
        class="BbImagesPicker-preview"
      >
        <div
          class="BbImagesPicker-preview-image-wrapper"
          :class="{ 'BbImagesPicker-preview-image-wrapper--clickable': !item.status || item.status === 'success' }"
          @click="previewImage(item)"
        >
          <img :src="item.url" class="BbImagesPicker-preview-image" />
          <div v-if="item.status === 'uploading'" class="BbImagesPicker-status">
            <van-loading type="spinner" size="20" />
          </div>
          <div v-if="item.status === 'failed'" class="BbImagesPicker-status BbImagesPicker-status--failed">
            <van-icon name="close" size="20" color="#ee0a24" />
          </div>
          <div
            v-if="!disabled && !readonly"
            class="BbImagesPicker-delete"
            @click.stop="handleDelete(item, index)"
          >
            <van-icon name="clear" size="14" color="#dddddd" />
          </div>
        </div>
        <slot name="description" :item="item" :index="index" :modelIndex="modelValue.findIndex(nItem => (typeof nItem === 'string' ? nItem : nItem.url) === item.originalUrl)" />
      </div>

      <div
        v-if="!disabled && !readonly"
        class="BbImagesPicker-upload"
        @click="triggerUpload"
      >
        <van-icon name="photograph" size="24" color="#dcdee0" />
      </div>
    </div>

    <input
      ref="fileInputRef"
      v-bind="attrs"
      type="file"
      accept="image/*"
      :multiple="multiple"
      style="display: none"
      @change="onFileChange"
      @cancel="emit('cancel')"
    />
  </div>
</template>
<script setup>
const { VITE_API_FILE_URL } = import.meta.env;
const attrs = useAttrs();
const props = defineProps({
  colNum: {
    type: Number,
    default: 3,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  params: {
    type: Object,
    default: () => ({}),
  },
  responseUrlKey: {
    type: String,
    default: "url_friendly_path",
  },
  upload: {
    type: Boolean,
    default: true,
  },
  returnObject: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "cancel"]);
const fileInputRef = ref(null);
const fileList = ref(getFileList());
function getFileList() {
  return $cloneDeep(props.multiple ? props.modelValue : [props.modelValue]).reduce((list, item) => {
    if (!item) return list;
    list.push(
      typeof item === "string"
        ? {
            url: !item.startsWith("http")
              ? VITE_API_FILE_URL + item
            : item,
            originalUrl: item,
            isImage: true,
          }
        : {
            ...item,
            url: item.url && !item.url.startsWith("http")
              ? VITE_API_FILE_URL + item.url
              : item.url,
            originalUrl: item.url,
            isImage: true,
          }
    );
    return list;
  }, []);
}

watch(
  () => props.modelValue,
  () => {
    fileList.value = getFileList();
  }
);

const pickerStyle = computed(() => ({
  "--bb-images-picker-col-num": Math.max(1, Number(props.colNum) || 3),
  "--bb-images-picker-gap": "10px",
}));

const triggerUpload = () => {
  fileInputRef.value?.click();
};

defineExpose({ triggerUpload });

const onFileChange = (e) => {
  const rawFiles = Array.from(e.target.files || []);
  if (!rawFiles.length) {
    emit("cancel");
    return;
  }
  e.target.value = "";

  const files = rawFiles.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
  if (props.upload) {
    files.forEach(uploadImage);
  } else {
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        fileList.value.push({ url: f.url, isImage: true, content: base64 });
        emit("update:modelValue", props.multiple ? [...props.modelValue, base64] : base64);
      };
      reader.readAsDataURL(f.file);
    });
  }
};

const previewImage = (item) => {
  if (item.status === 'uploading' || item.status === 'failed') return;
  showImagePreview({
    images: fileList.value
      .filter((v) => !v.status || v.status === 'success')
      .map((v) => v.url),
    startPosition: fileList.value.filter((v) => !v.status || v.status === 'success').findIndex((v) => v.url === item.url),
  });
};

const handleDelete = (item, index) => {
  if (item.status === "uploading" || item.status === "failed") {
    $toast("请等待图片上传完成");
    return;
  }
  const targetIndex = props.modelValue.findIndex((v) => {
    if (!v) return false;
    const rawUrl = typeof v === "string" ? v : v.url;
    return item.url.endsWith(rawUrl);
  });
  if (targetIndex > -1) {
    emit(
      "update:modelValue",
      props.modelValue.filter((_, i) => i !== targetIndex)
    );
  } else {
    fileList.value.splice(index, 1);
  }
};

function uploadImage(file) {
  const item = reactive({
    url: file.url,
    file: file.file,
    status: "uploading",
  });
  if(props.multiple) fileList.value.push(item);
  else fileList.value = [item];
  $uploadFile({
    url: "/files/upload/custom",
    data: [
      ...Object.entries(props.params || {}).map(([name, value]) => ({
        name,
        value,
      })),
      {
        name: "file",
        value: file.file,
        fileName: file.file?.name,
      },
    ],
  })
    .then(({ [props.responseUrlKey]: url }) => {
      if (!url) throw new Error("上传图片失败");
      item.status = "success";
      item.originalUrl = url;
      const result = props.returnObject ? {url} : url
      emit("update:modelValue", props.multiple ? [...props.modelValue, result] : result);
    })
    .catch(() => {
      item.status = "failed";
      $toast("上传图片失败");
      setTimeout(() => {
        const index = fileList.value.indexOf(item);
        if (index > -1) fileList.value.splice(index, 1);
      }, 2000);
    });
}

</script>
<style scoped lang="less">
.BbImagesPicker {
  width: 100%;
  line-height: 0;
  .BbImagesPicker-grid {
    display: grid;
    grid-template-columns: repeat(var(--bb-images-picker-col-num), minmax(0, 1fr));
    gap: var(--bb-images-picker-gap);
  }
  .BbImagesPicker-preview {
    position: relative;
    .BbImagesPicker-preview-image-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      border-radius: 8px;
      background-color: #fafafa;
      &--clickable {
        cursor: pointer;
      }
    }
    .BbImagesPicker-preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .BbImagesPicker-status {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.6);
    }
    .BbImagesPicker-delete {
      position: absolute;
      right: 2px;
      top: 2px;
      width: 16px;
      height: 16px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  }
  .BbImagesPicker-upload {
    width: 100%;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: #f7f8fa;
  }
}
</style>
