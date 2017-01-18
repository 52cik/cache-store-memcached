'use strict'

const EventEmitter = require('events')
const Memcached = require('memcached')

/**
 * @class MemcachedStore
 * @extends {EventEmitter}
 */
class MemcachedStore extends EventEmitter {
  /**
   * Initialize MemcachedStore with the given `options`.
   *
   * @param {Object} options
   */
  constructor(options) {
    super()
    options = options || {}

    this.prefix = options.prefix || '' // key 前缀
    this.ttl = options.ttl || 10 // 默认10秒

    if (!options.client) {
      if (!options.hosts) {
        options.hosts = '127.0.0.1:11211'
      }

      if (options.algorithm) {
        this.algorithm = options.algorithm
      }

      options.client = new Memcached(options.hosts, options)
    }

    this.client = options.client
  }

  /**
   * Translates the given `sid` into a memcached key, optionally with prefix.
   *
   * @param {string} sid
   * @api private
   */
  getKey(sid) {
    return this.prefix + sid
  }

  /**
   * Fetch cache by the given sid.
   *
   * @param {string} sid
   * @param {function} callback
   * @public
   */
  get(sid, callback) {
    sid = this.getKey(sid)

    this.client.get(sid, function (err, data) { // 读取数据
      if (err) {
        return callback(err)
      }

      try {
        if (data) {
          callback(null, JSON.parse(data))
        } else {
          callback(null)
        }

      } catch (e) {
        callback(e)
      }
    })
  }

  /**
   * Commit the given data with the given sid to the store.
   *
   * @param {string} sid
   * @param {object} data
   * @param {number} expires
   * @param {function} callback
   * @public
   */
  set(sid, data, expires, callback) {
    sid = this.getKey(sid)
    this.client.set(sid, JSON.stringify(data), expires, callback)
  }

  /**
   * Destroy the session associated with the given session ID.
   *
   * @param {string} sid
   * @public
   */
  destroy(sid, callback) {
    sid = this.getKey(sid)
    this.client.del(sid, callback)
  }

  /**
   * Clear all cache.
   *
   * @param {function} callback
   * @public
   */
  clear(callback) {
    this.client.flush(callback)
  }
}

/**
 * Module exports.
 */
module.exports = MemcachedStore
