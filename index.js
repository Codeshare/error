'use strict'

const assertArgs = require('assert-args')
const compose = require('101/compose')
const defaults = require('101/defaults')
const equals = require('101/equals')
const not = require('101/not')
const createError = require('http-errors')
const pick = require('101/pick')
const pluck = require('101/pluck')

const assertErr = function (err) {
  AppError.assert(err instanceof Error, 500, '`err` must be an `Error`', { invalidErr: err })
}

const throwErr = function (err) {
  throw err
}

const createAppError = function () {
  let args = assertArgs(arguments, {
    '[status]': 'number',
    '[message]': 'string',
    '[data]': 'object',
    '[err]': assertErr
  })
  return new AppError(args.status, args.message, args.err, args.data)
}

const AppError = module.exports = class AppError extends Error {
  constructor () {
    super()
    const args = assertArgs(arguments, {
      '[status]': 'number',
      '[message]': 'string',
      '[err]': assertErr,
      '[data]': 'object'
    })
    defaults(args, {
      status: 500,
      data: { }
    })
    const err = args.err
    if (err) {
      args.message = args.message || err.message
      args.data.err = err
    }
    const props = pick(args, 'data')

    return createError(args.status, args.message, props)
  }
  /**
   * wrap an error
   * @param  {[type]} status  [description]
   * @param  {[type]} message [description]
   * @param  {[type]} err     [description]
   * @param  {[type]} data    [description]
   * @return {[type]}         [description]
   */
  static wrap () {
    const args = assertArgs(arguments, {
      '[status]': 'number',
      '[err]': assertErr,
      '[data]': 'object'
    })
    defaults(args, {
      status: 500,
      data: { }
    })
    const status = args.status
    const err = args.err
    const data = args.data
    return !args.err
      ? createAppError.bind(null, status, data)
      : createAppError(status, data, err)
  }
  /**
   * wrap and throw an error
   * @param  {[type]} status  [description]
   * @param  {[type]} message [description]
   * @param  {[type]} err     [description]
   * @param  {[type]} data    [description]
   * @return {[type]}         [description]
   */
  static throw (status, message, data) {
    return compose(
      throwErr,
      data
        ? createAppError.bind(null, status, message, data)
        : message
         ? createAppError.bind(null, status, message)
         : createAppError.bind(null, status)
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
  /**
   * helper to ignore statuses
   * @param  {[type]} status [description]
   * @return {[type]}        [description]
   */
  static statusNot (status) {
    return compose(not(equals(status)), pluck('status'))
  }
}
