import BbLoadingIcon from "../BbLoadingIcon/BbLoadingIcon.vue";
import { createApp } from "vue";

const loading = function () {
    this.num = 0;
};
loading.prototype.open = function () {
    if(!this.num) {
        this.num = 0;
    }
    this.num++;
    if (this.num > 1) {
        return;
    }
    const d = document.createElement("div");
    d.id = "loading";
    const styles = {
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "888",
        background: "rgba(0, 0, 0, 0.2)"
    }
    for (let key in styles) {
        d.style[key] = styles[key];
    }
    const app = createApp(BbLoadingIcon);
    app.mount(d);
    document.querySelector("body").appendChild(d);
    document.querySelector("body").style.overflow = "hidden";
}
loading.prototype.close = function (num = 1) {
    this.num -= num;
    if (this.num < 1) {
        if(this.num <= 0) {
            this.num = 0;
        }
        const d = document.querySelector("#loading");
        if (d) {
            d.remove();
            document.querySelector("body").style.overflow = "auto";
        }
    }
}
loading.prototype.clear = function () {
    this.num = 0;
    this.close();
}
export default loading;
