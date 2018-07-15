//一个简单版本的Promise的typescript实现


if (!Promise) {
    type PromiseStatus = 'pending' | 'resolved' | 'rejected';
    type Resolved = (data: any) => void;
    type rejected = (data: Error) => void;
    type thenCallBack = (data: any) => any;
    type catchCallBack = (data: Error) => any;
    type Executor = (resolved: Resolved, rejected: rejected) => void;
    /**
     * @
     * @class Promise
     */
    class Promise {
        // promose状态
        private status: PromiseStatus = 'pending';
        // resolved 时获取到的数据
        private data: any = undefined;
        // resolved回调函数列表
        private onResolvedCallBackList: thenCallBack[];
        // rejected 回调函数列表
        private onRejectedCallBackList: catchCallBack[];

        /**
         *Creates an instance of Promise.
         * @param {Executor} executor 创建promise时传入的立即执行函数
         * @memberof Promise
         */
        constructor(executor: Executor) {
            // 在状态变更时调用对应的注册号的回调函数
            const resolve = (data: any) => {
                if (this.status === 'pending') {
                    this.status = 'resolved';
                    this.data = data;
                    this.onResolvedCallBackList.forEach(fn => fn(data))
                }
            }
            const reject = (data: Error) => {
                if (this.status === 'pending') {
                    this.status = 'rejected';
                    this.data = data;
                    this.onRejectedCallBackList.forEach(fn => fn(data))
                }
            }
            try {
                executor(resolve, reject);
            } catch (error) {
                reject(error);
            }
        }


        then = (onResolved: any, onRejected: any) => {
            // 规矩规范，如果传入的值不是函数，则忽略
            onResolved = typeof onResolved === 'function' ? onResolved : data => data;
            onResolved = typeof onRejected === 'function' ? onRejected : data => { throw data };
            if (this.status === 'resolved') {
                return new Promise((onResolved, onRejected) => {
                    try {
                        const res: any = onResolved(this.data);
                        // 判断返回的是否是promise
                        if (res in Promise) {
                            res.then(onResolved, onRejected)
                        }
                    } catch (error) {
                        onRejected(error);
                    }
                })
            }
        }
    }
}