Contrail.Map = function (linkItems) {

    this.current = undefined;
    this._size = 0;
    if (linkItems === false) {
        this.disableLinking();
    }
};


/**
 * 获取当前map
 * @return 当前对象
 */
Contrail.Map.noop = function () {
    return this;
};
/**
 * 非法操作
 * @return
 */
Contrail.Map.illegal = function () {
    throw new Error("非法操作，Map已经被禁用");
};
/**
 *
 * @param obj
 * @param foreignKeys
 * @return
 */
Contrail.Map.from = function (obj, foreignKeys) {
    var map = new Contrail.Map();
    for (var prop in obj) {
        if (foreignKeys || obj.hasOwnProperty(prop)) {
            map.put(prop, obj[prop]);
        }
    }
    return map;
};
/**
 * 禁用map
 * @return
 */
Contrail.Map.prototype.disableLinking = function () {
    this.link = Contrail.Map.noop;
    this.unlink = Contrail.Map.noop;
    this.disableLinking = Contrail.Map.noop;
    this.next = Contrail.Map.illegal;
    this.key = Contrail.Map.illegal;
    this.value = Contrail.Map.illegal;
    this.clear = Contrail.Map.illegal;
    return this;
};
/**
 * 返回hash值 例如：number 123
 * @param value key/value
 * @return
 */
Contrail.Map.prototype.hash = function (value) {
    return (typeof value) + ' ' + (value instanceof Object ? (value.__hash || (value.__hash = ++arguments.callee.current)) : value.toString());
};
/**
 * 返回map的长度
 * @return
 */
Contrail.Map.prototype.size = function () {
    return this._size;
};
Contrail.Map.prototype.hash.current = 0;
/**
 * 通过key获取value
 * @param key
 * @return
 */
Contrail.Map.prototype.get = function (key) {
    var item = this [this.hash(key)];
    return item === undefined ? undefined : item.value;
};
/**
 * 向map中添加数据
 * @param key 键
 * @param value 值
 * @return
 */
Contrail.Map.prototype.put = function (key, value) {
    var hash = this.hash(key);
    if (this [hash] === undefined) {
        var item = {key: key, value: value};
        this [hash] = item;
        this.link(item);
        ++this._size;
    } else {
        this [hash].value = value;
    }
    return this;
};
/**
 * 通过key删除数据
 * @param key
 * @return
 */
Contrail.Map.prototype.remove = function (key) {
    var hash = this.hash(key);
    var item = this [hash];
    if (item !== undefined) {
        --this._size;
        this.unlink(item);
        delete this [hash];
    }
    return this;
};
/**
 * 清除map
 * @return
 */
Contrail.Map.prototype.clear = function () {
    while (this._size) {
        this.remove(this.key());
    }
    return this;
};
/**
 * 处理队列
 * @param item
 * @return
 */
Contrail.Map.prototype.link = function (item) {
    if (this._size == 0) {
        item.prev = item;
        item.next = item;
        this.current = item;
    } else {
        item.prev = this.current.prev;
        item.prev.next = item;
        item.next = this.current;
        this.current.prev = item;
    }
};
Contrail.Map.prototype.unlink = function (item) {
    if (this._size == 0) {
        this.current = undefined;
    } else {
        item.prev.next = item.next;
        item.next.prev = item.prev;
        if (item === this.current) {
            this.current = item.next;
        }
    }
};
/**
 * 获取下一个
 * @return
 */
Contrail.Map.prototype.next = function () {
    this.current = this.current.next;
    return this;
};
/**
 * 获取key
 * @return
 */
Contrail.Map.prototype.key = function () {
    return this.current.key;
};
/**
 * 获取value
 * @return
 */
Contrail.Map.prototype.value = function () {
    return this.current.value;
};

Contrail.Map.prototype.toArray = function () {
    var array = new Contrail.Array();

    for (var i = 0; i++ < this.size(); this.next()) {
        array.push(this.value());
    }


    return array;
}
