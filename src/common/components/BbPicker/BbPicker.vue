<script setup name="BbPicker">
import { ref, computed, watch } from "vue";
const showPicker = ref(false);
const pickerValue = ref([])

const props = defineProps({
  modelValue: {},
  options: {
    type: Array,
    default: () => []
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  inputStyle: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "input"
  },
  iconColor: {
    type: String,
    default: ""
  },
  placeholder: {},
  name: {},
  rules: {
    type: Array,
    default: () => new Array()
  },
  border: {
    type: Boolean,
    default: false
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
  holdPlaceholder: {
    type: Boolean,
    default: false
  },
  labelKey: {
    type: String,
    default: "label"
  },
  valueKey: {
    type: String,
    default: "value"
  },
  multiple: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: "normal"
  }
})
const emits = defineEmits(["onVisible", "update:modelValue", "confirm"]);
const selectedObj = computed(() => {
  const val = props.modelValue;
  return optionList.value.find(({ value }) => val === value) || {};
})

const optionList = computed(() => {
  return props.options.map(({ [props.labelKey]: label, [props.valueKey]: value, ...other }) => ({ text: label, value, ...other }));
})

watch(showPicker, (n) => {
  emits("onVisible", n);
  if (!n) return;
  if (!props.modelValue && props.modelValue !== 0) {
    pickerValue.value = []
  } else {
    if (!props.multiple) {
      const item = optionList.value.find(({ value }) => props.modelValue === value);
      pickerValue.value = !item ? [] : [item.value];
    } else {
      pickerValue.value = optionList.value.map((group, index) => {
        const item = group.find(({ value }) => props.modelValue[index] === value);
        return item?.value;
      })
    }
  }
})
const onConfirm = ({ selectedOptions }) => {
  const multiple = props.multiple;
  const result = !multiple ? selectedOptions[0] : selectedOptions;
  emits("update:modelValue", !multiple ? result.value : result.map(({ value }) => value));
  emits("confirm", !multiple ? result[0] : result);
  onShowChange();
}


function clear() {
  emits("update:modelValue");
  emits("confirm");
}

const onShowChange = () => {
  if (props.readonly || props.disabled) return;
  if (optionList.length === 0) {
    $failToast("无选项");
    return;
  }
  showPicker.value = !showPicker.value;
}

</script>

<template>
  <div class="bb-picker-container" :class="{ border: border }">
    <van-field :size="size" v-if="type === 'input'" :modelValue="selectedObj.text || ''" :name="name" :label="label"
      :required="required" readonly :is-link="!disabled && !props.readonly" :disabled="disabled"
      :rules="rules[0] ? rules : [{ required, message: `请选择${label}` }]"
      :placeholder="(disabled || props.readonly) && !holdPlaceholder ? '' : placeholder || `请选择${label}`"
      @click.stop="onShowChange">
      <template #left-icon v-if="$slots['left-icon']">
        <slot name="left-icon"></slot>
      </template>
      <template #button v-if="clearable && selectedObj.value !== undefined">
        <van-icon :color="iconColor" name="clear" @click.stop="clear" />
      </template>
    </van-field>
    <div v-else class="input-box" @click.stop="onShowChange">
      <slot>
        <div :class="['value-box', !disabled ? 'disabled' : '']">
          <input :name="name" :rules="rules" :class="{ value: true, border }" :placeholder="placeholder" readonly
            type="text" :style="inputStyle" :value="selectedObj.text || ''">
          <div v-if="!readonly" class="arrow">
            <van-icon v-if="clearable && (selectedObj.text || selectedObj.text === 0)" color="#aaaaaa" name="close"
              @click.stop="$emit('update:modelValue', null)" />
            <van-icon :class="{ 'arrow-icon': true, 'up': showPicker }" :color="iconColor" name="arrow-down" />
          </div>
        </div>
      </slot>
    </div>
    <van-popup v-model:show="showPicker" round position="bottom" teleport="body">
      <van-picker v-model="pickerValue" :columns="optionList" @cancel="showPicker = false" @confirm="onConfirm" />
    </van-popup>
  </div>


</template>

<style lang="less" scoped>
// .bb-picker-container {
//     width: 100%;
//     box-sizing: border-box;
//     @flex-row-center();
//     color: @theme-color;
.bb-picker-container {
  position: relative;

  &.border {
    &::after {
      position: absolute;
      box-sizing: border-box;
      content: " ";
      pointer-events: none;
      right: var(--van-padding-md);
      bottom: 0;
      left: var(--van-padding-md);
      border-bottom: 1px solid var(--van-cell-border-color);
      transform: scaleY(.5);
    }
  }

}

.input-box {
  // @full();
}

.value-box {
  width: 100%;
  height: 100%;
  @flex-row-center();

  // color: @theme-color;
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

    .arrow-icon {
      transition: all 0.3s;

      &.up {
        transform: rotate(180deg);
      }
    }
  }
}

// }</style>