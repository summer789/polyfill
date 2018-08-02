//一个简单版本的Promise的typescript实现


if (!Promise) {
    type PromiseStatus = 'pending' | 'resolved' | 'rejected';
    type Resolved = (data: any) => void;
    type Rejected = (data: Error) => void;
    type thenCallBack = (data: any) => any;
    type catchCallBack = (data: Error) => any;
    type Executor = (resolved: Resolved, rejected: Rejected) => void;
    type PesolvePromise = (promise2: Promise, x: any, resolve: Resolved, reject: Rejected) => void;
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

        static resolve = (data: any) => {
            return new Promise((resolve) => {
                resolve(data);
            })
        }

        static reject = (data: any) => {
            return new Promise((resolve, reject) => {
                reject(data);
            })
        }

        static race = (promises: Promise[]) => {
            return new Promise((resolve, reject) => {
                promises.forEach(promise => {
                    promise.then(resolve, reject);
                });
            })
        }

        static all = (promises: Promise[]) => {
            let arr: any[] = [];
            return new Promise((resolve, reject) => {
                promises.forEach((promise: Promise, index) => {
                    promise.then((data: any) => {
                        arr[index] = data;
                        if (index === promises.length - 1) {
                            resolve(arr);
                        }
                    })
                })
            })
        }

        /**
         *Creates an instance of Promise.
         * @param {Executor} executor 创建promise时传入的立即执行函数
         * @memberof Promise
         */
        constructor(executor: Executor) {
            // 在状态变更时调用对应的注册号的回调函数
            this.then = this.then.bind(this);
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


        then(onResolved?: any, onRejected?: any) {
            // 规范，如果传入的值不是函数，则忽略
            onResolved = typeof onResolved === 'function' ? onResolved : data => data;
            onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

            const promise2 = new Promise((onResolved, onRejected) => {

                try {
                    if (this.status === 'resolved') {
                        // 实现异步调用
                        setTimeout(() => {
                            try {
                                const res: any = onResolved(this.data);
                                resolvePromise(promise2, res, onResolved, onRejected);
                            } catch (error) {
                                onRejected(error);
                            }
                        })

                    }

                    if (this.status === 'rejected') {
                        //实现异步调用
                        setTimeout(() => {
                            try {
                                let x = onRejected(this.data);
                                resolvePromise(promise2, x, onResolved, onRejected);
                            } catch (error) {
                                onRejected(error);
                            }
                        })
                    }

                    // 当状态还是pending时，将回调推入到回调队列中，后续调用

                    if (this.status === 'pending') {
                        this.onResolvedCallBackList.push((data) => {
                            setTimeout(() => {
                                try {
                                    const res: any = onResolved(data);
                                    resolvePromise(promise2, res, onResolved, onRejected);
                                } catch (error) {
                                    onRejected(error);
                                }
                            })

                        });

                        this.onRejectedCallBackList.push((err) => {
                            setTimeout(() => {
                                try {
                                    let x = onRejected(err);
                                    resolvePromise(promise2, x, onResolved, onRejected);
                                } catch (error) {
                                    onRejected(error);
                                }
                            })
                        })
                    }

                } catch (error) {
                    onRejected(error);
                }
            })
            return promise2;
        }

        catch(fn) {
            return this.then(null, fn);
        }

    }

    function resolvePromise(promise2: Promise, x: Promise | any, resolve: Resolved, reject: Rejected): void {

        // 如何是循环引用，会导致一直无法接受，报错处理
        if (promise2 === x) {
            reject(new TypeError('promise循环引用'));
            return;
        }
        // 检测是否已经调用过了，防止多次调用；
        let isCall: boolean = false;
        if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
            try {
                // 如果then是函数，则认为x是一个Promise
                if (typeof (x as Promise).then === 'function') {
                    // 执行then方法
                    (x as Promise).then(y => {
                        if (isCall) {
                            return;
                        }
                        isCall = true;
                        // 递归调用判断
                        resolvePromise(promise2, y, resolve, reject);
                    }, err => {
                        if (isCall) {
                            return;
                        }
                        isCall = true;
                        reject(err);
                    });
                } else {
                    resolve(x);
                }
            } catch (error) {
                if (isCall) {
                    return;
                }
                isCall = true;
                reject(error);
            }
        } else {
            resolve(x);
        }
    }
}