import BbLoadingIcon from "../BbLoadingIcon/BbLoadingIcon.vue";
import { createApp } from "vue";

class BbLoadingFun {
  private num = 0;

  open() {
    if (!this.num) {
      this.num = 0;
    }
    this.num++;
    if (this.num > 1) {
      return;
    }
    const d = document.createElement("div");
    d.id = "loading";
    const styles: Partial<CSSStyleDeclaration> = {
      position: "fixed",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "888",
      background: "rgba(0, 0, 0, 0.2)",
    };
    for (const key in styles) {
      d.style[key as any] = styles[key as keyof CSSStyleDeclaration] as string;
    }
    const app = createApp(BbLoadingIcon);
    app.mount(d);
    document.querySelector("body")?.appendChild(d);
    const body = document.querySelector("body");
    if (body) body.style.overflow = "hidden";
  }

  close(num = 1) {
    this.num -= num;
    if (this.num < 1) {
      if (this.num <= 0) {
        this.num = 0;
      }
      const d = document.querySelector("#loading");
      if (d) {
        d.remove();
        const body = document.querySelector("body");
        if (body) body.style.overflow = "auto";
      }
    }
  }

  clear() {
    this.num = 0;
    this.close();
  }
}

export default BbLoadingFun;
