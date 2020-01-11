// new Vue({data:{...}})

class Vue {
    constructor(options) {
        this.$options = options;


        // 数据响应化
        this.$data = options.data;

        // 监听数据
        this.observe(this.$data);
    }

    observe(value) {
        if(!value || typeof value !== 'object') {
            return;
        }

        // 遍历对象
        Object.keys(value).forEach(key=>{
            this.defineReactive(value, key, value[key]);
        });
    }

    // 数据响应化
    defineReactive(value, key, val) {
        Object.defineProperty(obj, key, {
            get() {
                return val;
            },
            set(newVal) {
                if(newVal === val) {
                    return;
                }
                val = newVal;
                console.log(`${key}属性更新为${val}`);
            }
        })
    }

}
