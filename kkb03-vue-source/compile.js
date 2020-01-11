/**
 * 获取dom、遍历dom
 * 获取插值文本、获取标签特定属性值
 * 设置响应式
 */
class Compile {
    constructor(el, vm) {
        // 要遍历的宿主节点
        this.$el = document.querySelector(el);
        this.$vm = vm;

        if(this.$el) {
            // 将宿主节点内容转移到片段中进行操作
            this.$fragmenet = this.node2Fragment(this.$el);
            // 遍历节点内所有内容，执行编译
            // 同时将相应的内容转换成浏览器能识别的语言
            this.compile(this.$fragmenet);
            // 将碎片替换掉编译前的容器
            this.$el.appendChild(this.$fragmenet);
        }
    }

    // 将node节点内容转移至片段进行操作
    // 不直接在页面内进行dom操作，提高性能
    node2Fragment(el) {
        const fragment = document.createDocumentFragment();
        let child;
        while(child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }

    // 遍历一遍所有内容
    compile(el) {
        const childNodes = el.childNodes;

        // 正则里加了括号 为了后面通过RegExp.$1能取到括号中的内容
        const textReg = /\{\{(.*)\}\}/;

        Array.from(childNodes).forEach(node=>{
            if(this.isElementNode(node)) {
                this.compileElementNode(node);
            }
            if(this.isTextNode(node) && textReg.test(node.textContent)) {
                this.compileTextNode(node, RegExp.$1);
            }

            // 深度遍历
            if(node.childNodes && node.childNodes.length > 0) {
                this.compile(node);
            }
        });
    }

    // 是否元素节点
    isElementNode(node) {
        return node.nodeType === 1;
    }

    // 是否文本节点
    isTextNode(node) {
        return node.nodeType === 3;
    }

    // 编译元素
    compileElementNode(node) {
        const attrs = node.attributes;

        if(attrs && attrs.length > 0) {
            Array.from(attrs).forEach(attr=>{
                const attrName = attr.name;
                const attrVal = attr.value;

                // v-xxx指令
                if(this.isDefaultDirective(attrName)) {
                    this.compileDefaultNode(node, attrName.substring(2), attrVal);
                }
                // 事件指令
                else if(this.isEventDirective(attrName)) {
                    this.compileEventNode(node, attrName.substring(1), attrVal);
                }
                // 其他的指令 通过 elseif去过滤
                // ...
            })
        }
    }

    // 编译文本
    compileTextNode(node, exp) {
        // node.textContent = this.$vm[exp];
        this.update(node, this.$vm, exp, "text");
    }

    // 编译事件指令
    compileEventNode(node, eventName, methodName) {
        const methodFn = this.$vm.$methods && this.$vm.$methods[methodName];
        if(!methodFn || typeof methodFn !== 'function') {
            return;
        }
        // 添加节点事件
        node.addEventListener(eventName, methodFn.bind(this.$vm));
    }

    // 编译v指令
    compileDefaultNode(node, name, value) {
        // v-html
        if(name === 'html') {
            node.innerHTML = value;
        }
        // v-model双向绑定
        else if(name === 'model') {
            // input的 value设置
            this.update(node, this.$vm, value, 'model');
            // input的 input事件设置
            node.addEventListener("input", (event)=>{
                this.$vm[value] = event.target.value;
            })
        }
    }

    // 是否普通指令
    isDefaultDirective(attrName) {
        return attrName.indexOf("v-") === 0;
    }

    // 是否事件指令
    isEventDirective(attrName) {
        return attrName.indexOf("@") === 0;
    }

    // 更新函数
    update(node, vm, exp, dir) {
        const updateFn = this[`${dir}Updater`];
        updateFn && updateFn(node, vm[exp]);
        // 在这里做依赖收集
        new Watcher(vm, exp, value => {
            updateFn && updateFn(node, value);
        });
    }

    // 文本更新器
    textUpdater(node, value) {
        node.textContent = value;
    }

    // 双绑数据更新器
    modelUpdater(node, value) {
        node.value = value;
    }
}
