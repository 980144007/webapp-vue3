

<script setup name="BbPagePicker">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

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
    },
    title: {
        default: ""
    },
    onRefresh: {
        type: Function,
    },
    onLoadMore: {
        type: Function,
    },
    multiple: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(["update:modelValue", "confirm", "onVisible"]);

const showPicker = ref(false);
const pickerValue = ref([]);

const selectedObjList = computed(() => {
    // console.log(88,props, props.options)
    const valList = $cloneDeep(!props.multiple ? [props.modelValue] : props.modelValue);
    return props.options.filter(({value}) => valList.includes(value)) || [];
});

const selectable = computed(() => {
    return props.options.some(({disabled}) => !disabled);
});

watch(showPicker, (n) => {
    emit("onVisible", n);
    if(!n) return;
    pickerValue.splice(0, pickerValue.length, ...$cloneDeep(!props.multiple ? [props.modelValue] : props.modelValue || []));
});

function clear() {
    pickerValue.splice(0, pickerValue.length);
    onConfirm(false);
}

function onConfirm(show) {
    // console.log(22,pickerValue)
    const val = props.multiple ? $cloneDeep(pickerValue) : $cloneDeep(pickerValue?.[0])
    emit("update:modelValue", val);
    const valList = $cloneDeep(!props.multiple ? [val] : val);
    const valueList = props.options.filter(({value}) => valList.includes(value)) || [];
    emit("confirm", props.multiple ? valueList : valueList?.[0]);
    onShowChange(show);
}

function onShowChange(show = !showPicker.value) {
    if(props.readonly) return;
    showPicker.value = show;
}

function onOptionClick({value}) {
    const list = pickerValue;
    
    const index = list.findIndex(item => {
        return item === value;
    })
    if(index > -1) {
        if(!props.multiple) {
            pickerValue.splice(0, 1);
        } else {
            pickerValue.splice(index, 1);
        }
        
        return;
    }
    if(!props.multiple) {
        pickerValue.splice(0, 1, value);
    } else {
        pickerValue.push(value);
    }
    
    // console.log(item)
}

function myOnRefresh() {
    pickerValue.splice(0, pickerValue.length, ...$cloneDeep(!props.multiple ? [props.modelValue] : props.modelValue || []));
    return props.onRefresh?.() || undefined;
}

function refresh() {
    const cmList = $refs?.cmList;
    cmList?.refresh();
}

function check(isSingle = false) {
    const cmList = $refs?.cmList;
    cmList?.check(isSingle);
}

onMounted(() => {
    
});

onBeforeUnmount(() => {
    
});

</script>

<template>
    <div class="bb-page-picker-container">
        <div class="input-box" @click.stop="onShowChange()">
            <slot>
                <div :class="['value-box', !selectable ? 'disabled' : '']">
                    <div class="value-input-box">
                        <input :name="name" :rules="rules" :class="{value: true, border}" :placeholder="placeholder" readonly type="text" :style="inputStyle" :value="selectedObjList.map(({text}) => text) || ''" />
                    </div>
                    <!-- <div class="value" :style="inputStyle" v-text="selectedObj.text || ''"></div> -->
                    
                    <div v-if="!readonly" class="arrow">
                        <van-icon v-if="clearable && selectedObjList.length" color="#aaaaaa" name="close" @click.stop="clear" />
                        <van-icon :color="iconColor" name="arrow" />
                    </div>
                </div>
            </slot>
        </div>
        <van-popup class="bb-page-picker-popup" v-model:show="showPicker" round position="bottom" teleport="body">
            <div class="header-container">
                <div class="control-box">
                    <button class="btn cancel van-haptics-feedback" @click="onShowChange()">关闭</button>
                    <div class="title" v-text="title"></div>
                    <button class="btn confirm van-haptics-feedback" @click="onConfirm()">确定</button>
                </div>
                <div class="filter-box">
                    <slot name="filter"></slot>
                </div>
                <div class="divider"></div>
            </div>
            <div class="container">
                <bb-list ref="cmList" :onRefresh="myOnRefresh" :onLoadMore="onLoadMore">
                    <div class="list-container">
                        <van-checkbox-group :modelValue="pickerValue" shape="square">
                            <van-cell
                                v-for="(item) in options"
                                :key="item.value"
                                clickable
                                @click="onOptionClick(item)"
                            >
                                <template #value>
                                    <div class="option-content">
                                        <span v-text="item.text"></span>
                                    </div>
                                </template>
                                <template #icon>
                                    <van-checkbox
                                        shape="round"
                                        :name="item.value"
                                    >
                                        <template>
                                            <slot name="option" :info="item"></slot>
                                        </template>
                                    </van-checkbox>
                                </template>
                            </van-cell>
                            
                        </van-checkbox-group>
                    </div>
                </bb-list>
            </div>
        </van-popup>
    </div>
    

</template>
<style lang="less">
    .bb-page-picker-popup {
        height: 60vh;
        @flex-col-center();
        .header-container {
            width: 100%;
            box-sizing: border-box;
            .control-box {
                @flex-row-center();
                .title {
                    @flex-row-grow();
                    text-align: center;
                    margin: 0px @font-size-xs;
                }
                .btn {
                    height: var(--van-picker-toolbar-height);
                    color: var(--van-picker-cancel-action-color);
                    padding: var(--van-padding-sm);
                    font-size: var(--van-picker-action-font-size);
                    border: none;
                    cursor: pointer;
                    background: none;
                    &.confirm {
                        color: @theme-color;
                    }
                }
            }
            .divider {
                width: calc(100 - @padding-xs * 2);
                margin: 0px @padding-xs;
                height: 4px;
                background: @background-gray-color;
                @radius(2px);
            }
        }
        .container {
            @flex-col-grow();
            width: 100%;
            box-sizing: border-box;
            .list-container {
                .option-content {
                    margin-left: 5%;
                    text-align: left;
                    color: @font-normal-color;
                    word-break: break-all;
                }
            }
        }
    }
</style>
<style lang="less" scoped>
.bb-page-picker-container {
    width: 100%;
    box-sizing: border-box;
    @flex-row-center();
    color: @theme-color;
    .input-box {
        @full();
        .value-box {
            width: 100%;
            @flex-row-center();
            color: @theme-color;
            .arrow {
                // display: none;
                margin-left: @padding-base;
            }
            .value-input-box {
                @flex-row-grow();
                position: relative;
                @flex-row();
                &::after {
                    content: "";
                    display: block;
                    position: absolute;
                    left: 0px;
                    right: 0px;
                    top: 0px;
                    bottom: 0px;
                }
                .value {
                    @flex-row-grow();
                    background: none;
                    
                    padding: @padding-base;
                    font-size: @font-size-lg;
                    line-height: @font-size-lg;
                    height: @font-size-lg;
                    border: none;
                    .ellipsis();
                    &.border {
                        border-bottom: 1px solid  @border-color;
                    }
                    
                    
                    &::placeholder {
                        opacity: 0.4;
                    }
                    
                }
            }
            
            .arrow {
                @flex-row-center();
            }
        }
    }
    
}
</style>