'use strict'

const should = require('should')
const MemcachedStore = require('..')

const store = new MemcachedStore()
const noop = function () { }

describe('MemcachedStore', () => {
  it('#set & #get & #clear', (done) => {
    store.set('foo', 'bar', 10, () => {
      store.get('foo', (err, data) => {
        should(data).be.a.String().and.equal('bar')
        store.clear(done)
      })
    })
  })

  it('#destroy', (done) => {
    store.set('foo', 'bar', 10, () => {
      store.destroy('foo', () => {
        store.get('foo', (err, data) => {
          should(data).be.Undefined()
          done()
        })
      })
    })
  })
})
