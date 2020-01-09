class Vue {
    constructor(props) {

        // 数据赋值
        this.$data = props.data;

        // 监听数据变化
        this.observe(this.$data);

    }

    // 监听数据
    observe(data) {
        if(!data || typeof data !== 'object') {
            return;
        }

        // 遍历全部属性
        Object.keys(data).forEach(key=>{
            // 实现数据响应
            this.defineReactive(data, key, data[key]);
        });
    }

    defineReactive(data, key, value) {
        // 递归调用
        this.observe(data[key]);

        // 对象属性在这里之前都做了递归遍历
        // 这里就对对象属性进行过滤
        // if(typeof data[key] === 'object') {
        //     return;
        // }

        // 每个属性值对应一个Dep对象实例
        const dep = new Dep();

        Object.defineProperty(data, key, {
            get() {
                // 当get方法触发 说明这个属性有被使用到 那就创建一个对应的Watcher对象
                // 其实是一个骇客操作
                Dep.target && dep.addDep(Dep.target);
                return value;
            },
            set(newVal) {
                if(newVal === value) {
                    return;
                }

                // 更新数据
                // console.log("更新数据啦！");

                // 属性的Dep对象实例通知watchers进行更新操作
                dep.notify();
            }
        })
    }

}


// 依赖对象 一个数据对应一个Dep对象
// 用来管理Watcher
class Dep {
    constructor() {

        // 依赖数组
        this.watchers = [];
    }

    addDep(watcher) {
        this.watchers.push(watcher)
    }

    // 通知底下所有的watcher更新
    notify() {
        this.watchers.forEach(watcher=>watcher.update())
    }

}


// 观察者
// 单个观察者只负责单个使用到数据的关系
class Watcher {
    constructor() {
        // 将当前的Watcher实例指向Dep静态target属性
        Dep.target = this;
    }

    update() {
        console.log("更新数据啦！");
    }
}