
##### npm install rollup-plugin-dts -D   生成声明文件，将ts文件中的类型声明信息转化成 .d.ts类型的声明文件
#####  npm install rollup-plugin-typescript2 -D  将ts代码转换成js代码

##### pv 即 PageView,用户每次对网站的访问均被记录 主要有 hash 和history
##### hash 使用hashchange 监听 history没有可以监听的需要重写方法



##### installTracker()初始化Tracker

### pv 即 PageView,用户每次对网站的访问均被记录 通过对路由的监控实现记录 主要有 hash 和history
1. hash  使用 window.addEventListener('hashchange', handler) 来添加 hashchange 事件监听器 
2. history history API  go back  forward pushState  replaceState   popstate 事件监听器无法监听后两个，需重写方法，调用history原始方法并将新方法的上下文传入，使新函数的参数应用到原始方法，添加相应事件监听器去进行监听

### 独立访客 一个电脑客户端为一个访客
1. 没有登录 通过uuid第三方库生成唯一id
2. 登录情况下获取后台返回的id 
3. 向外暴露两个公共方法方便用户传入 id或其他自定义参数

#### 向外暴露sendTracker() 用于用户手动上报

### DOM事件监听(主要监听鼠标事件)
1. 需要监听的元素添加一个属性 用来区分是否需要监听 target-key

### js错误上报
1. 捕获js报错 添加error事件监听器
2. 捕获promise 错误 添加unhandledrejection事件监听器 返回promise ,通过.catch获取信息

### 上报采用navigator.sendBeacon上报 即使页面关闭了 也会完成请求 (参数有类型限制)