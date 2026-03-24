<template>
  <div class="bb-BbDateRangeFieldPicker-container">
    <template v-if="mode == 1">
      <div class="label">{{ labels[0] }}</div>
      <div class="col" style="margin-right: 8px;">

        <div class="value" @click="onValueClick()">
          <div class="text" style="font-size: 14px;">
            {{
              textFormatter(
                modelValue.startDate
                  ? $moment(modelValue.startDate).format("YYYY/MM/DD")
                  : ""
              )
            }}
          </div>
          <!-- <div class="icon">
            <van-icon name="calendar-o" size="20" />
          </div> -->
        </div>
      </div>
      至
      <div class="col" style="margin-left: 8px;">
        <div class="value" @click="onValueClick(false)">
          <div class="text" style="font-size: 14px;">
            {{
              textFormatter(
                modelValue.endDate
                  ? $moment(modelValue.endDate).format("YYYY/MM/DD")
                  : ""
              )
            }}
          </div>
          <!-- <div class="icon">
            <van-icon name="calendar-o" size="20" />
          </div> -->
        </div>
      </div>
    </template>
    <template v-else-if="mode == 2">
      <div class="col">
        <div class="label">开始时间</div>
        <div class="value" @click="onValueClick()">
          <div class="text">
            {{
              textFormatter(
                modelValue.startDate
                  ? $moment(modelValue.startDate).format("YYYY/MM/DD")
                  : ""
              )
            }}
          </div>
          <div class="icon">
            <van-icon name="calendar-o" size="20" />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="label">结束时间</div>
        <div class="value" @click="onValueClick(false)">
          <div class="text">
            {{
              textFormatter(
                modelValue.endDate
                  ? $moment(modelValue.endDate).format("YYYY/MM/DD")
                  : ""
              )
            }}
          </div>
          <div class="icon">
            <van-icon name="calendar-o" size="20" />
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="mode == 3">
      <div class="col" @click="onValueClick()">
        <input class="value-input" type="text" :placeholder="labels[0]" :value="modelValue.startDate || modelValue.endDate ? `${modelValue.startDate
            ? $moment(modelValue.startDate).format('YYYY/MM/DD')
            : ''}-${modelValue.endDate
            ? $moment(modelValue.endDate).format('YYYY/MM/DD')
            : ''}` : ''" readonly />
      </div>
    </template>
    <BbDateRangePicker v-model="pickerValue" v-model:show="showDatePicker" :defaultIndex="defaultIndex" :maxDate="maxDate" :minDate="minDate" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, inject } from "vue";
const $moment = inject("$moment");
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Object,
    default: () => ({
      startDate: null,
      endDate: null,
    }),
  },
  textFormatter: {
    type: Function,
    default: (val) => val,
  },
  labels: {
    type: Array,
    default: () => ["开始时间", "结束时间"],
  },
  mode: {
    type: [Number, String],
    default: 1,
  },
  maxDate: {
    type: Date,
    default: new Date(),
  },
  minDate: {
    type: Date,
    default: new Date(new Date().getFullYear() - 10, 0, 1),
  },
});
const emit = defineEmits(["update:modelValue"]);

const defaultIndex = ref(0);
const showDatePicker = ref(false);
const pickerValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    console.log(23, val);
    emit("update:modelValue", val);
  },
});

function onValueClick(isStartDate: boolean = true) {
  if (props.disabled) return;
  defaultIndex.value = isStartDate ? 0 : 1;
  showDatePicker.value = true;
}
</script>
<style lang="less" scoped>
.bb-BbDateRangeFieldPicker-container {
  width: 100%;
  display: flex;
  align-items: center;

  &>.label {
    margin-right: 14px;
  }

  .col {
    flex-grow: 1;
    width: 0px;
    display: flex;
    align-items: center;
    color: @font-normal-color;

    input {
      outline: none;
      border: none;
      width: 100%;
      height: 100%;
    }

    &+.col {
      margin-left: 14px;
    }

    .label {
      font-size: 16px;
      margin-right: 6px;
    }

    .value {
      flex-grow: 1;
      width: 0px;
      display: flex;
      align-items: center;
      border: 1px solid #f1f1f6;
      border-radius: 5px;
      padding: 6px 4px;

      .text {
        flex-grow: 1;
        width: 0px;
        font-size: 16px;
        line-height: 1;
        min-height: 16px;
        text-align: center;
      }

      .icon {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>