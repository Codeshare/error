'use strict'

const assertArgs = require('assert-args')
const compose = require('101/compose')
const defaults = require('101/defaults')
const equals = require('101/equals')
const exists = require('101/exists')
const not = require('101/not')
const createError = require('http-errors')
const pick = require('101/pick')
const pluck = require('101/pluck')

const assertErr = function (err) {
  AppError.assert(!exists(err) || err instanceof Error, 500, '`err` must be an `Error`', null, { invalidErr: err  })
}

const throwErr = function (err) {
  throw err
}

const createAppError = function () {
  let args = assertArgs(arguments, {
    '[status]': 'number',
    '[message]': 'string',
    '[err]': assertErr,
    '[data]': 'object' // obj matches errs
  })
  return new AppError(args.status, args.message, args.err, args.data)
}

const extendStack = function (err, err2) {
  err.stack += '\n----\n' + err2.stack
}

const AppError = module.exports = class AppError extends Error {
  constructor () {
    super()
    const args = assertArgs(arguments, {
      '[status]': 'number',
      '[message]': 'string',
      '[err]': assertErr,
      '[data]': 'object' // obj matches errs
    })
    defaults(args, {
      status: 500,
      data: { },
      stack: ''
    })
    args.data = Object.assign({}, args.data) // shallow copy
    if (args.data.errs) {
      if (args.data.errs.length === 1) {
        args.err = args.data.errs[0]
        delete args.data.errs
      } else {
        args.message = args.message || 'multiple errors'
        args.data.errs.forEach((err) => extendStack(args, err))
      }
    }
    if (args.err) {
      args.message = args.message || args.err.message
      extendStack(args, args.err)
      args.data.err = args.err
    }
    const props = pick(args, 'data')
    const err = createError(args.status, args.message, props)
    err.stack += args.stack
    return err
  }
  /**
   * wrap an error
   * @param  {Integer} status
   * @param  {String} message
   * @param  {Object} data
   * @return {Function} (err) => throw AppError.wrap(err)
   */
  static wrap () {
    const args = assertArgs(arguments, {
      '[status]': 'number',
      '[message]': 'string',
      '[data]': 'object',
    })
    defaults(args, {
      status: 500,
      data: { }
    })
    const status = args.status
    const message = args.message
    const data = args.data
    return (err) => new AppError(status, message, err, data)
  }
  /**
   * wrap and throw an error
   * @param  {Integer} status
   * @param  {String} message
   * @param  {Object} data
   * @return {Function} (err) => throw AppError.wrap(err)
   */
  static throw (status, message, data) {
    return compose(
      throwErr,
      this.wrap(status, message, data)
    )
  }
  /**
   * [assert description]
   * @param  {[type]} expression [description]
   * @return {[type]}            [description]
   */
  static assert (expression /* args */) {
    if (!expression) {
      const args = Array.prototype.slice.call(arguments, 1)
      throw createAppError.apply(null, args)
    }
  }
}
