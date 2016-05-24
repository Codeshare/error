const beforeEach = global.beforeEach
const describe = global.describe
const it = global.it

const expect = require('code').expect

const AppError = require('../index.js')

describe('codeshare-error', function () {
  beforeEach(function () {
    this.status = 404
    this.message = 'message'
    this.err = new Error('boom')
    this.data = { foo: 1 }
  })
  describe('constructor', function () {
    it('should create an appError (status, message, err, data)', function () {
      const err = new AppError(this.status, this.message, this.err, this.data)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal(Object.assign({ err: this.err }, this.data))
    })
    it('should create an appError (status, message, data)', function () {
      const err = new AppError(this.status, this.message, this.data)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal(this.data)
    })
    it('should create an appError (status, message, data{errs[1]})', function () {
      const errs = [new Error('boom1')]
      const data = Object.assign({ errs: errs }, this.data)
      const err = new AppError(this.status, this.message, data)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.stack).to.contain(errs[0].stack)
      expect(err.data).to.equal(Object.assign({ err: errs[0] }, this.data))
    })
    it('should create an appError (status, message, data{errs[2]})', function () {
      const errs = [new Error('boom1'), new Error('boom2')]
      const data = Object.assign({ errs: errs }, this.data)
      const err = new AppError(this.status, this.message, data)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      errs.forEach(function (_err) {
        expect(err.stack).to.contain(_err.stack)
      })
      expect(err.data).to.equal(data)
    })
    it('should create an appError (status, message, data{errs[2]})', function () {
      const errs = [new Error('boom1'), new Error('boom2')]
      const data = Object.assign({ errs: errs }, this.data)
      const err = new AppError(this.status, data)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal('multiple errors')
      expect(err.stack).to.exist()
      errs.forEach(function (_err) {
        expect(err.stack).to.contain(_err.stack)
      })
      expect(err.data).to.equal(data)
    })
    it('should create an appError (status, message, err)', function () {
      const err = new AppError(this.status, this.message, this.err)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal({ err: this.err })
    })
    it('should create an appError (status, message)', function () {
      const err = new AppError(this.status, this.message)
      expect(err.status).to.equal(this.status)
      expect(err.data).to.equal({})
    })
    it('should create an appError (message)', function () {
      const err = new AppError(this.message)
      expect(err.status).to.equal(500)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal({})
    })
  })
  describe('wrap', function () {
    it('should return a partial fn to wrap an error (status, message, data)', function () {
      const wrap = AppError.wrap(this.status, this.message, this.data)
      expect(wrap).to.be.a.function()
      const err = wrap(this.err)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal(Object.assign({ err: this.err }, this.data))
    })
    it('should return a partial fn to wrap an error (status, message)', function () {
      const wrap = AppError.wrap(this.status, this.message)
      expect(wrap).to.be.a.function()
      const err = wrap(this.err)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal({ err: this.err })
    })
    it('should return a partial fn to wrap an error (message)', function () {
      const wrap = AppError.wrap(this.message)
      expect(wrap).to.be.a.function()
      const err = wrap(this.err)
      expect(err.status).to.equal(500)
      expect(err.message).to.equal(this.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal({ err: this.err })
    })
    it('should return a partial fn to wrap an error (status)', function () {
      const wrap = AppError.wrap(this.status)
      expect(wrap).to.be.a.function()
      const err = wrap(this.err)
      expect(err.status).to.equal(this.status)
      expect(err.message).to.equal(this.err.message)
      expect(err.stack).to.exist()
      expect(err.data).to.equal({ err: this.err })
    })
  })
  describe('throw', function () {
    it('should return a partial fn to wrap and throw an error', function () {
      const throwFn = AppError.throw(this.status)
      expect(throwFn).to.be.a.function()
      try {
        throwFn(this.err)
        throw new Error('should not make it here')
      } catch (err) {
        expect(err.status).to.equal(this.status)
        expect(err.message).to.equal(this.err.message)
        expect(err.stack).to.exist()
        expect(err.stack).to.contain(this.err.stack)
        expect(err.data).to.equal({ err: this.err })
      }
    })
  })
  describe('assert', function () {
    it('should assert value or throw error', function () {
      // assert pass
      AppError.assert(true, this.status, this.message, this.err, this.data)
      // assert fail
      try {
        AppError.assert(false, this.status, this.message, this.err, this.data)
      } catch (err) {
        expect(err.status).to.equal(this.status)
        expect(err.message).to.equal(this.message)
        expect(err.stack).to.exist()
        expect(err.data).to.equal(Object.assign({ err: this.err }, this.data))
      }
    })
  })
})