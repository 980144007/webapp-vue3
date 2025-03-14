

<script setup name="BbDatePicker">
import { ref, watch, computed } from "vue";
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
    options: {
        type: Array,
        default: () => new Array()
    },
    type: {
        type: String,
        default: ""
    },
    inputStyle: {
        type: String,
    },
    className: {
        type: String,
    },
})
const emits = defineEmits(["onVisible", "update:modelValue", "confirm"]);
watch(showPicker, (n) => {
    emits("onVisible", n);
})
const selectedObj = computed(() => {
    const val = props.modelValue;
    const fn = (list) => {
        const obj = list.find(({value}) => val === value);
        if(obj) return obj;
        for(let i = 0; i < list.length; i++) {
            const {children} = list[i];
            if(children) {
                const obj = fn(children);
                if(obj) return obj;
            };
        }
        return;
    }
    return fn(props.options) || {};
})
const onConfirm = ({value}) => {
    emits("update:modelValue", value);
    emits("confirm", value);
    onShowChange();
    // console.log(selectedObj.value)
}


function clear() {
    emits("update:modelValue");
    emits("confirm");
}

const onShowChange = () => {
    if(props.readonly) return;
    showPicker.value = !showPicker.value;
}

</script>

<template>
    <!-- <div class="bb-picker-container" ref="bb-picker"> -->
        <van-field
            :class="className"
            v-if="type === 'input'"
            :modelValue="selectedObj.label"
            :name="name"
            :label="label"
            :required="required"
            readonly
            :is-link="!disabled && !readonly"
            :disabled="disabled"
            @click.stop="onShowChange"
            :placeholder="placeholder || `请选择${label}`"
            :rules="rules[0] ? rules : [{ required, message: `请选择${label}` }]"
        >
            <template #left-icon v-if="$slots['left-icon']">
                <slot name="left-icon"></slot>
            </template>
            <template #button v-if="!readonly && clearable && modelValue !== undefined">
                <van-icon :color="iconColor" name="clear" @click.stop="clear" />
            </template>
        </van-field>
        <div v-else class="input-box" @click.stop="onShowChange">
            <slot>  
                <div  :class="['value-box', !disabled ? 'disabled' : '']">
                    <div :style="inputStyle" :class="{value: true}" v-text="selectedObj.label || ''"></div>
                    <!-- <input :name="name" :rules="rules" :style="inputStyle" :class="{value: true}" :placeholder="placeholder" readonly type="text" :value="selectedObj.label || ''"> -->
                    <div v-if="!readonly" class="arrow">
                        <van-icon :class="{'arrow-icon': true, 'up': showPicker}" :color="iconColor" name="arrow-down" />
                    </div>
                </div>
            </slot>
        </div>
        <van-popup v-model:show="showPicker" round position="bottom" teleport="body">
            <van-cascader
                :modelValue="modelValue"
                :title="`请选择${label}`"
                :options="options"
                @close="showPicker = false"
                @finish="onConfirm"
            >
              <!-- <template #options-top>555</template> -->
            </van-cascader>
        </van-popup>
    <!-- </div> -->
    

</template>

<style lang="less" scoped>
// .bb-picker-container {
//     width: 100%;
//     box-sizing: border-box;
//     @flex-row-center();
//     color: @theme-color;
    .input-box {
        @full();
        @flex-row-center();
    }
    .value-box {
        width: 100%;
        @flex-row-center();
        // color: @theme-color;
        &.disabled {
            .arrow {
                // display: none;
            }
        }
        .value {
            background: none;
            // @flex-row-grow();
            padding: 0px @padding-base;
            font-size: @font-size-lg;
            // line-height: @font-size-lg;
            // height: @font-size-lg;
            border: none;
            
            
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
// }
</style>