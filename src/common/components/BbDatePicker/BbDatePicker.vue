<script setup name="BbDatePicker">
import { ref, watch, inject } from "vue";
const $moment = inject("$moment");
const showPicker = ref(false);

const props = defineProps({
  modelValue: {},
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
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
  iconColor: {
    type: String,
    default: ""
  },
})
const emits = defineEmits(["onVisible", "update:modelValue", "confirm"]);
watch(showPicker, (n) => {
  emits("onVisible", n);
})
const onConfirm = ({ selectedValues }) => {
  const val = selectedValues.join("-");
  emits("update:modelValue", val);
  emits("confirm", val);
  onShowChange();
}


function clear() {
  emits("update:modelValue");
  emits("confirm");
}

const onShowChange = () => {
  if (props.readonly || props.disabled) return;
  showPicker.value = !showPicker.value;
}

</script>

<template>
  <div class="bb-date-picker-container" ref="bb-picker">
  <van-field :class="className" :modelValue="modelValue" :name="name" :label="label" :required="required" readonly
    :is-link="!props.disabled && !props.readonly" :disabled="props.disabled" @click.stop="onShowChange"
    :placeholder="props.disabled || props.readonly ? '' : placeholder || `请选择${label}`"
    :rules="rules[0] ? rules : [{ required, message: `请选择${label}` }]">
    <template #left-icon v-if="$slots['left-icon']">
      <slot name="left-icon"></slot>
    </template>
    <template #button v-if="clearable && modelValue !== undefined && !props.disabled && !props.readonly">
      <van-icon :color="iconColor" name="clear" @click.stop="clear" />
    </template>
  </van-field>
  <van-popup v-model:show="showPicker" round position="bottom" teleport="body">
    <van-date-picker :modelValue="(modelValue || $moment().format('YYYY-MM-DD')).split('-')" @confirm="onConfirm"
      @cancel="showPicker = false" />
  </van-popup>
  </div>


</template>

<style lang="less" scoped>
.bb-picker-container {
  width: 100%;
  box-sizing: border-box;
  @flex-row-center();
  color: @theme-color;

  .input-box {
    @full();
  }

  .value-box {
    width: 100%;
    @flex-row-center();
    color: @theme-color;

    &.disabled {
      .arrow {
        // display: none;
      }
    }

    .value {
      background: none;
      @flex-row-grow();
      padding: @padding-base;
      font-size: @font-size-lg;
      line-height: @font-size-lg;
      height: @font-size-lg;
      border: none;

      &.border {
        border-bottom: 1px solid @border-color;
      }

      .ellipsis();

      &::placeholder {
        opacity: 0.4;
      }

    }

    .arrow {
      @flex-row-center();
    }
  }
}
</style>