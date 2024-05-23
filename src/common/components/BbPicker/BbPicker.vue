

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
        default: false
    },
    inputStyle: {
        type: String,
        default: ""
    },
    iconColor: {
        type: String,
        default: "#E96736"
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
    }
})
const emits = defineEmits(["onVisible", "update:modelValue", "confirm"]);
const selectedObj = computed(() => {
    const val = props.modelValue;
    return props.options.find(({value}) => val === value) || {};
})
const selectable = computed(() => {
    return props.options.some(({disabled}) => !disabled);
})
watch(showPicker, (n) => {
    emits("onVisible", n);
    if(!n) return;
    pickerValue.value = !props.modelValue && props.modelValue !== 0 ? [props.options.value] : [props.modelValue]
})
const onConfirm = ([item]) => {
    emits("update:modelValue", item && item.value);
    emits("confirm", item);
    onShowChange();
}

const onShowChange = () => {
    if(props.readonly || props.options.length === 0) return;
    showPicker.value = !showPicker.value;
}

</script>

<template>
    <div class="bb-picker-container" ref="bb-picker">
        <div class="input-box" @click.stop="onShowChange">
            <slot>
                <div :class="['value-box', !selectable ? 'disabled' : '']">
                    <input :name="name" :rules="rules" :class="{value: true, border}" :placeholder="placeholder" readonly type="text" :style="inputStyle" :value="selectedObj.text || ''">
                    <!-- <div class="value" :style="inputStyle" v-text="selectedObj.text || ''"></div> -->
                    
                    <div v-if="!readonly" class="arrow">
                        <van-icon v-if="clearable && (selectedObj.text || selectedObj.text === 0)" color="#aaaaaa" name="close" @click.stop="$emit('update:modelValue', null)" />
                        <van-icon :color="iconColor" name="arrow" />
                    </div>
                </div>
            </slot>
        </div>
        <van-popup v-model:show="showPicker" round position="bottom" teleport="body">
            <van-picker
                v-model="pickerValue"
                :columns="options"
                @cancel="showPicker = false"
                @confirm="onConfirm"
            />
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
                border-bottom: 1px solid  @border-color;
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