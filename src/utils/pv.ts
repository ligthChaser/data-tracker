export const createHistoryEvent = <T extends keyof History>(type: T) => {
    //使用索引签名获取传入的history方法
    const origin = history[type];
    return function (this: any) {
        const res = origin.apply(this, arguments)
        //创建事件  
        const e = new Event(type);
        //dispathEvent派发事件
        window.dispatchEvent(e);
        return res;
    }
}
