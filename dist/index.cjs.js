'use strict';

//版本
var TrackerConfig;
(function (TrackerConfig) {
    TrackerConfig["version"] = "1.0.0";
})(TrackerConfig || (TrackerConfig = {}));

const createHistoryEvent = (type) => {
    //使用索引签名获取传入的history方法
    const origin = history[type];
    return function () {
        const res = origin.apply(this, arguments);
        //创建事件  
        const e = new Event(type);
        //dispathEvent派发事件
        window.dispatchEvent(e);
        return res;
    };
};

/// 点击 双击 右击 按下 释放 进入元素 移出元素或其子元素 移入某元素或其子元素
const MouseEventList = [
    "click",
    "dblclick",
    "contextmenu",
    "mousedown",
    "mouseup",
    "mouseenter",
    "mouseout",
    "mouseover",
];
class Tracker {
    constructor(options) {
        this.data = Object.assign(this.initDef(), options);
        this.installTracker();
    }
    initDef() {
        window.history["pushState"] = createHistoryEvent("pushState");
        window.history["replaceState"] = createHistoryEvent("replaceState");
        return {
            sdkVersion: TrackerConfig.version,
            historyTracker: false,
            hashTracker: false,
            domTracker: false,
            jsError: false,
        };
    }
    //获取用户id 没有登录通过 uuid库生成唯一id，如果登录了使用后台返回的userid
    setUerId(uuid) {
        this.data.uuid = uuid;
    }
    //用户自定义的一些参数
    setExtra(extra) {
        this.data.extra = extra;
    }
    //手动上报
    sendTracker(data) {
        this.reportTracker(data);
    }
    //dom 点击上报
    targetKeyReport() {
        MouseEventList.forEach((event) => {
            window.addEventListener(event, (e) => {
                //此处类型推断是错误的，需要进行类型断言为 HTMLElement
                const target = e.target;
                const targetValue = target.getAttribute("target-key");
                if (targetValue) {
                    this.sendTracker({
                        targetKey: targetValue,
                        event,
                    });
                }
            });
        });
    }
    // js错误上报
    jsError() {
        this.errorEvent();
        this.promiseReject();
    }
    //捕获js报错
    errorEvent() {
        window.addEventListener('error', (e) => {
            this.sendTracker({
                targetKey: 'message',
                event: 'error',
                message: e.message
            });
        });
    }
    //捕获promise 错误
    promiseReject() {
        window.addEventListener('unhandledrejection', (event) => {
            event.promise.catch(error => {
                this.sendTracker({
                    targetKey: "reject",
                    event: "promise",
                    message: error
                });
            });
        });
    }
    //PageView事件监听
    captureEvents(eventList, targetKey, data) {
        eventList.forEach((event) => {
            window.addEventListener(event, () => {
                this.reportTracker({ event, targetKey, data });
            });
        });
    }
    //根据用户的参数来判断是否监听history和hash
    installTracker() {
        if (this.data.historyTracker) {
            this.captureEvents(["pushState", "replaceState", "popstate"], "history-pv");
        }
        if (this.data.hashTracker) {
            this.captureEvents(["hashchange"], "history-pv");
        }
        if (this.data.domTracker) {
            this.targetKeyReport();
        }
        // if (this.data.jsError) {
        //     this.jsError()
        // }
    }
    //使用navigator.sendBeacon上报， 跟 XMLHttrequest 对比  navigator.sendBeacon 即使页面关闭了 也会完成请求 而XMLHTTPRequest 不一定
    //navigator.sendBeacon第二参数的格式不能是object对象，可以是字符串、blob对象等
    reportTracker(data) {
        const params = Object.assign(this.data, data, {
            time: new Date().getTime(),
        });
        // 将请求头设为键值对的形式
        let headers = {
            type: "application/x-www-form-urlencoded",
        };
        let blob = new Blob([JSON.stringify(params)], headers);
        navigator.sendBeacon(this.data.requestUrl, blob);
    }
}

module.exports = Tracker;
