import {
    DefaultOptons,
    TrackerConfig,
    Options,
    reportTrackerData,
} from "../types/index";
import { createHistoryEvent } from "../utils/pv";
/// 点击 双击 右击 按下 释放 进入元素 移出元素或其子元素 移入某元素或其子元素
const MouseEventList: string[] = [
    "click",
    "dblclick",
    "contextmenu",
    "mousedown",
    "mouseup",
    "mouseenter",
    "mouseout",
    "mouseover",
];

export default class Tracker {
    public data: Options;

    constructor(options: Options) {
        this.data = Object.assign(this.initDef(), options);
        this.installTracker();
    }

    private initDef(): DefaultOptons {
        window.history["pushState"] = createHistoryEvent("pushState");
        window.history["replaceState"] = createHistoryEvent("replaceState");
        return <DefaultOptons>{
            sdkVersion: TrackerConfig.version,
            historyTracker: false,
            hashTracker: false,
            domTracker: false,
            jsError: false,
        };
    }

    //获取用户id 没有登录通过 uuid库生成唯一id，如果登录了使用后台返回的userid
    public setUerId<T extends DefaultOptons["uuid"]>(uuid: T) {
        this.data.uuid = uuid;
    }

    //用户自定义的一些参数
    public setExtra<T extends DefaultOptons["extra"]>(extra: T) {
        this.data.extra = extra;
    }

    //手动上报
    public sendTracker<T extends reportTrackerData>(data: T) {
        this.reportTracker(data);
    }

    //dom 点击上报
    private targetKeyReport() {
        MouseEventList.forEach((event) => {
            window.addEventListener(event, (e) => {
                //此处类型推断是错误的，需要进行类型断言为 HTMLElement
                const target = e.target as HTMLElement;
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
    private jsError() {
        this.errorEvent();
        this.promiseReject();
    }

    //捕获js报错
    private errorEvent() {
        window.addEventListener('error', (e) => {
            this.sendTracker({
                targetKey: 'message',
                event: 'error',
                message: e.message
            })
        })
    }
    //捕获promise 错误
    private promiseReject() {
        window.addEventListener('unhandledrejection', (event) => {
            event.promise.catch(error => {
                this.sendTracker({
                    targetKey: "reject",
                    event: "promise",
                    message: error
                })
            })
        })
    }

    //PageView事件监听
    private captureEvents<T>(eventList: string[], targetKey: string, data?: T) {
        eventList.forEach((event) => {
            window.addEventListener(event, () => {
                this.reportTracker({ event, targetKey, data });
            });
        });
    }

    //初始化Tracker
    private installTracker() {
        if (this.data.historyTracker) {
            this.captureEvents(
                ["pushState", "replaceState", "popstate"],
                "history-pv"
            );
        }
        if (this.data.hashTracker) {
            this.captureEvents(["hashchange"], "history-pv");
        }
        if (this.data.domTracker) {
            this.targetKeyReport();
        }
        if (this.data.jsError) {
            this.jsError()
        }
    }

    //使用navigator.sendBeacon上报， 跟 XMLHttrequest 对比  navigator.sendBeacon 即使页面关闭了 也会完成请求 而XMLHTTPRequest 不一定
    //navigator.sendBeacon第二参数的格式不能是object对象，可以是字符串、blob对象等
    private reportTracker<T>(data: T) {
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
