

<script setup name="BbDateRangePicker">
import { ref, computed, watch } from "vue";

const emits = defineEmits(["update:modelValue", "confirm"]);

const startDate = ref([]);
const endDate = ref([]);
const startMax = computed(() => endDate.value.length ? new Date(endDate.value.join("-")) : new Date());

const endMin = computed(() => startDate.value.length ? new Date(startDate.value.join("-")) : new Date());
const endMax = new Date();

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
    if(!n) return;
    const {
        startDate: start,
        endDate: end
    } = value.value;
    if(start) {
        startDate.value = $moment(start).format("YYYY-MM-DD").split("-");
    }
    if(end) {
        endDate.value = $moment(end).format("YYYY-MM-DD").split("-");
    }
})
function onConfirm() {
    
    const val = {
        startDate: startDate.value.join("-"),
        endDate: endDate.value.join("-")
    }
    value.value = val;
    emits("confirm", val);
}
</script>

<template>
    <van-dialog 
    :show="showPicker" 
    title="寄件日期" 
    show-cancel-button 
    teleport="body" 
    @confirm="onConfirm" 
    @cancel="showPicker = false">
        <div class="divider"></div>
        <van-picker-group
            :tabs="['开始日期', '结束日期']"
            :show-toolbar="false"
            >
            <van-date-picker
                v-model="startDate"
                :max-date="startMax"
            />
            <van-date-picker v-model="endDate" :min-date="endMin" :max-date="endMax" />
        </van-picker-group>

</van-dialog>
</template>

<style lang="less" scoped>
.divider {
    height: 1px;
    background-color: @background-gray-color;
    margin-top: 8px;
}
</style>