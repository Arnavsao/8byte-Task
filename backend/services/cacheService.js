const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 15, checkperiod: 20 });

function get(key) {
    return cache.get(key);
}

function set(key, value, ttl = 15) {
    return cache.set(key, value, ttl);
}

function del(key) {
    return cache.del(key);
}

function flush() {
    return cache.flushAll();
}

module.exports = {
    get,
    set,
    del,
    flush
};
