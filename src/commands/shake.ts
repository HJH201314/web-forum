import type { DirectiveBinding } from "vue";

/**
 * v-shake : 指令绑定值发生变化时，给元素添加抖动效果
 * CSS(.shake) 在 animation.scss 中定义
 * @param el
 * @param binding
 */
function shake(el: HTMLElement, binding: DirectiveBinding<boolean>) {
  if (binding.value !== binding.oldValue) {
    // console.log(binding)
    el.classList.add("command-shake");
    setTimeout(() => {
      el.classList.remove("command-shake");
    }, 500);
  }
}

export default shake;