<script setup lang="ts" name="BbDialog">
import { ref, computed, watch } from "vue";

type DialogType = "info" | "warning" | "error" | "success";
type DialogAction = "confirm" | "cancel";

const innerShow = ref(false);

const typeConfig = {
  info: { icon: "info-o", confirmIcon: "info-o", color: "#1989fa", confirmBg: "#1989fa" },
  warning: { icon: "warning-o", confirmIcon: "warning-o", color: "#ff976a", confirmBg: "#ff976a" },
  error: { icon: "cross", confirmIcon: "cross", color: "#ee0a24", confirmBg: "#ee0a24" },
  success: { icon: "passed", confirmIcon: "success", color: "#07c160", confirmBg: "#07c160" },
};

const props = defineProps({
  show: {
    type: Boolean,
    default: undefined,
  },
  type: {
    type: String,
    default: "info",
    validator: (v) => ["info", "warning", "error", "success"].includes(v),
  },
  title: {
    type: String,
    default: "提示",
  },
  titleIcon: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: "",
  },
  showCancel: {
    type: Boolean,
    default: false,
  },
  cancelButtonText: {
    type: String,
    default: "取消",
  },
  showConfirm: {
    type: Boolean,
    default: true,
  },
  confirmButtonText: {
    type: String,
    default: "确认",
  },
  confirmButtonIcon: {
    type: String,
    default: "",
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: false,
  },
  beforeClose: {
    type: Function,
    default: null,
  },
});

const emits = defineEmits(["confirm", "cancel", "update:show", "closed"]);

const isShowControlled = computed(() => typeof props.show === "boolean");

const showDialog = computed({
  get() {
    return isShowControlled.value ? props.show : innerShow.value;
  },
  set(value) {
    if (!isShowControlled.value) {
      innerShow.value = value;
    }
    emits("update:show", value);
  },
});

const currentTypeConfig = computed(() => typeConfig[props.type as DialogType] || typeConfig.info);
const currentTitleIcon = computed(() => props.titleIcon || currentTypeConfig.value.icon);
const currentConfirmButtonIcon = computed(() => props.confirmButtonIcon || currentTypeConfig.value.confirmIcon);

watch(showDialog, (n) => {
  if (!n) {
    emits("closed");
  }
});

const confirmLoading = ref(false);
const cancelLoading = ref(false);

async function handleClose(action) {
  if (!props.beforeClose) {
    emits(action);
    showDialog.value = false;
    return;
  }

  // 对应按钮进入 loading 状态
  if (action === "confirm") {
    confirmLoading.value = true;
  } else {
    cancelLoading.value = true;
  }

  const result = props.beforeClose(action);
  const shouldClose = result instanceof Promise ? await result : result;

  // 结束 loading
  confirmLoading.value = false;
  cancelLoading.value = false;

  if (shouldClose) {
    emits(action);
    showDialog.value = false;
  }
}

function onConfirm() {
  handleClose("confirm");
}

function onCancel() {
  handleClose("cancel");
}

defineExpose({
  open: () => {
    showDialog.value = true;
  },
  close: () => {
    showDialog.value = false;
  },
});
</script>

<template>
  <van-popup
    v-model:show="showDialog"
    round
    position="center"
    :close-on-click-overlay="props.closeOnClickOverlay"
    class="bb-dialog-container"
  >
    <div class="bb-dialog-content">
      <div class="bb-dialog-title" v-if="props.title">
        <van-icon :name="currentTitleIcon" class="bb-dialog-title-icon" :style="{ color: currentTypeConfig.color }" />
        <span>{{ props.title }}</span>
      </div>
      <div class="bb-dialog-message" v-if="props.message">{{ props.message }}</div>
      <div class="bb-dialog-footer">
        <van-button
          v-if="props.showCancel"
          class="bb-dialog-cancel"
          block
          :loading="cancelLoading"
          :disabled="confirmLoading"
          @click="onCancel"
          size="small"
        >
          {{ props.cancelButtonText }}
        </van-button>
        <van-button
          v-if="props.showConfirm"
          size="small"
          class="bb-dialog-confirm"
          block
          :loading="confirmLoading"
          :disabled="cancelLoading"
          @click="onConfirm"
          :style="{ background: currentTypeConfig.confirmBg }"
        >
          <van-icon v-if="currentConfirmButtonIcon" :name="currentConfirmButtonIcon" class="bb-dialog-btn-icon" />
          {{ props.confirmButtonText }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<style lang="less" scoped>
.bb-dialog-content {
  width: 280px;
  padding: 24px;
  box-sizing: border-box;
}

.bb-dialog-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 16px;
  color: var(--van-text-color);
  margin-bottom: 16px;

  .bb-dialog-title-icon {
    font-size: 20px;
  }
}

.bb-dialog-message {
  padding: 0 0 16px 0;
  font-size: 14px;
  color: var(--van-text-color-3, #7a7a7a);
  line-height: 20px;
  text-align: center;
}

.bb-dialog-footer {
  display: flex;
  gap: 12px;

  .bb-dialog-cancel {
    flex: 1;
    border-radius: 8px;
    background: var(--app-canvas-muted, #f5f5f7);
    color: var(--van-text-color);
    border: none;
  }

  .bb-dialog-confirm {
    flex: 1;
    border-radius: 8px;
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .bb-dialog-btn-icon {
      margin-right: 2px;
    }
  }
}
</style>
