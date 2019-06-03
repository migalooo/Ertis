// https://github.com/arboleya/happens

export default class EventDispatcher {
  public listeners: any[];

  public on(event: string, fn: () => void) {
    this.validate(fn);
    this.init(event).push(fn);
  }

  public off(event: string, fn: () => void) {
    const pool = this.init(event);
    pool.splice(pool.indexOf(fn), 1);
  }

  public once(event: string, fn: () => void) {
    this.validate(fn);
    const wrapper = () => {
      this.off(event, wrapper);
      fn.apply(this, arguments);
    };
    this.on(event, wrapper);
  }

  public emit(event: string, ...args) {
    const pool = this.init(event).slice(0);
    for (const i in pool) pool[i].apply(this, [].slice.call(arguments, 1));
  }

  private validate(fn: () => void) {
    if (!(fn && fn instanceof Function))
      throw new Error(fn + ' is not a Function');
  }

  private init(event: string) {
    const tmp = this.listeners || (this.listeners = []);
    return tmp[event] || (tmp[event] = []);
  }
}
