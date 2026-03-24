<script setup name="BbDateRangePicker">
import { ref, computed, watch } from "vue";
const props = defineProps({
  title: {
    type: String,
    default: "选择日期范围"
  },
  defaultIndex: {
    default: 0
  },
  maxDate: {
    default: new Date()
  },
  minDate: {
    default: new Date(new Date().getFullYear() - 10, 0, 1)
  }
})
const emits = defineEmits(["update:modelValue", "confirm"]);

const startDate = ref([]);
const endDate = ref([]);
const startMax = computed(() => new Date(props.maxDate));
const startMin = computed(() => new Date(props.minDate));
const endMin = computed(() => startDate.value.length && new Date(startDate.value.join("-")) >= props.minDate ? new Date(startDate.value.join("-")) : new Date(props.minDate));
const endMax = new Date(props.maxDate);
const noLimited = ref(false);
watch(() => noLimited.value, (n) => {
  if(n) {
    onConfirm()
  }
})
const showPicker = defineModel("show");
const value = defineModel({
  type: Object,
  default() {
    return {
      startDate: "",
      endDate: ""
    }
  }
});
watch(showPicker, (n) => {
  if (!n) return;
  const {
    startDate: start,
    endDate: end
  } = value.value;
  if (start) {
    startDate.value = $moment(start).format("YYYY-MM-DD").split("-");
  }
  if (end) {
    endDate.value = $moment(end).format("YYYY-MM-DD").split("-");
  }
})
function onConfirm() {
  // console.log(555, startDate.value, endDate.value);
  const val = {
    startDate: noLimited.value ? "" : startDate.value.join("-"),
    endDate: noLimited.value ? "" : endDate.value.join("-")
  }
  // console.log(6666, val, startDate.value, endDate.value);
  value.value = val;
  emits("confirm", val);
  showPicker.value = false
}
</script>

<template>
  <van-dialog v-model:show="showPicker" :title="title" show-cancel-button teleport="body" @confirm="onConfirm" close-on-click-overlay
    @cancel="showPicker = false" destroyOnClose>
    <div class="divider"></div>
    <div class="control-tools">
      <van-checkbox v-model="noLimited">清空</van-checkbox>
    </div>
    <div class="group-box" :disabled="noLimited">
      <div class="box-cover">
      </div>
      <van-picker-group :active-tab="defaultIndex" :tabs="['开始日期', '结束日期']" :show-toolbar="false" disabled >
        <van-date-picker v-model="startDate" :min-date="startMin" :max-date="startMax" />
        <van-date-picker v-model="endDate" :min-date="endMin" :max-date="endMax" />
      </van-picker-group>
    </div>
  </van-dialog>
</template>

<style lang="less" scoped>
.van-dialog__content {

  .divider {
    height: 1px;
    background-color: @background-gray-color;
    margin-top: 8px;
  }

  .control-tools {
    padding: 0px 16px;
    margin-top: 8px;
  }

  .group-box {
    position: relative;

    .box-cover {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;

      display: none;
    }

    &[disabled=true] {
      filter: blur(2px);

      .box-cover {
        display: block;
      }
    }
  }
}
</style>