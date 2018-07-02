if (!Function.prototype.bind) {
  Function.prototype.bind = function (self) {
    if (typeof this !== 'function') {
      throw new TypeError('调用者必须为函数');
    }
  }
  /**
   * arguments是类数组，无法直接调用splice，需要借用数组方法
   * 第一个参数为绑定对象，第二个开始为参数List
   */
  var args = Array.prototype.slice.call(arguments, 1);
  var oldFn = this;
  var Temp = function () { }
  /**
   * 判断该函数是否已经绑定了
   */
  var finalThis = this instanceof Temp ? this : self;
  var newFn = function () {
    //合并调用bind时的参数与调用新函数的参数
    return oldFn.apply(finalThis, args.concat(Array.prototype.slice.call(arguments)));
  }

  if (this.prototype) {
    Temp.prototype = this.prototype;
  }
  newFn.prototype = new Temp();

  return newFn;
}
