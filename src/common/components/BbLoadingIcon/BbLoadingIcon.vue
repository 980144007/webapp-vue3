<script setup name="BbLoading">
defineProps({
    size: {
        type: String,
        default: "50px"
    }
})
</script>

<template>
    <svg
        :style="`width: ${size}`"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        class="lds-ellipsis"
    >
        <circle cx="84" cy="50" r="0" fill="#f3b72e">
            <animate
                attributeName="r"
                values="10;0;0;0;0"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="0s"
            ></animate>
            <animate
                attributeName="cx"
                values="84;84;84;84;84"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="0s"
            ></animate>
        </circle>
        <circle cx="84" cy="50" r="0.0170326" fill="#E8574E">
            <animate
                attributeName="r"
                values="0;10;10;10;0"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="-0.85s"
            ></animate>
            <animate
                attributeName="cx"
                values="16;16;50;84;84"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="-0.85s"
            ></animate>
        </circle>
        <circle cx="83.9421" cy="50" r="10" fill="#43A976">
            <animate
                attributeName="r"
                values="0;10;10;10;0"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="-0.425s"
            ></animate>
            <animate
                attributeName="cx"
                values="16;16;50;84;84"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="-0.425s"
            ></animate>
        </circle>
        <circle cx="49.9421" cy="50" r="10" fill="#304153">
            <animate
                attributeName="r"
                values="0;10;10;10;0"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="0s"
            ></animate>
            <animate
                attributeName="cx"
                values="16;16;50;84;84"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="0s"
            ></animate>
        </circle>
        <circle cx="16" cy="50" r="9.98297" fill="#f3b72e">
            <animate
                attributeName="r"
                values="0;0;10;10;10"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="0s"
            ></animate>
            <animate
                attributeName="cx"
                values="16;16;16;50;84"
                keyTimes="0;0.25;0.5;0.75;1"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                calcMode="spline"
                dur="1.7s"
                repeatCount="indefinite"
                begin="0s"
            ></animate>
        </circle>
    </svg>
</template>