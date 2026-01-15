/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {
  EmptyValue,
  getRawPrecisionValue,
  InterpreterValue,
  isExtendedNumber,
  NumberType,
  RawInterpreterValue,
} from '../InterpreterValue'
import {SimpleRangeValue} from '../../SimpleRangeValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric, NumericProvider, npvNumeric} from '../../Numeric'

/**
 *
 */
export class FinancialPlugin extends FunctionPlugin implements FunctionPluginTypecheck<FinancialPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'PMT': {
      method: 'pmt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},  // rate - high precision
        {argumentType: FunctionArgumentType.NUMERIC},  // periods - high precision
        {argumentType: FunctionArgumentType.NUMERIC},  // present value - high precision
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},  // future value
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},  // type (0 or 1)
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'IPMT': {
      method: 'ipmt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'PPMT': {
      method: 'ppmt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'FV': {
      method: 'fv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},  // rate - high precision
        {argumentType: FunctionArgumentType.NUMERIC},  // periods - high precision
        {argumentType: FunctionArgumentType.NUMERIC},  // payment - high precision
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},  // present value
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},  // type (0 or 1)
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'CUMIPMT': {
      method: 'cumipmt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'CUMPRINC': {
      method: 'cumprinc',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'DB': {
      method: 'db',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1, maxValue: 12, defaultValue: 12},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'DDB': {
      method: 'ddb',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, defaultValue: 2},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'DOLLARDE': {
      method: 'dollarde',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
      ],
    },
    'DOLLARFR': {
      method: 'dollarfr',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
      ],
    },
    'EFFECT': {
      method: 'effect',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ],
      returnNumberType: NumberType.NUMBER_PERCENT
    },
    'ISPMT': {
      method: 'ispmt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
    'NOMINAL': {
      method: 'nominal',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ],
      returnNumberType: NumberType.NUMBER_PERCENT
    },
    'NPER': {
      method: 'nper',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
    },
    'PV': {
      method: 'pv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'RATE': {
      method: 'rate',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0.1},
      ],
      returnNumberType: NumberType.NUMBER_PERCENT
    },
    'RRI': {
      method: 'rri',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
      returnNumberType: NumberType.NUMBER_PERCENT
    },
    'SLN': {
      method: 'sln',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'SYD': {
      method: 'syd',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'TBILLEQ': {
      method: 'tbilleq',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ],
      returnNumberType: NumberType.NUMBER_PERCENT
    },
    'TBILLPRICE': {
      method: 'tbillprice',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'TBILLYIELD': {
      method: 'tbillyield',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ],
      returnNumberType: NumberType.NUMBER_PERCENT
    },
    'FVSCHEDULE': {
      method: 'fvschedule',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},  // High precision value
        {argumentType: FunctionArgumentType.RANGE},
      ],
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'NPV': {
      method: 'npv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},  // High precision rate
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
      returnNumberType: NumberType.NUMBER_CURRENCY
    },
    'MIRR': {
      method: 'mirr',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.NUMERIC},  // High precision finance rate
        {argumentType: FunctionArgumentType.NUMERIC},  // High precision reinvest rate
      ],
      returnNumberType: NumberType.NUMBER_PERCENT
    },
    'PDURATION': {
      method: 'pduration',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ],
    },
    'XNPV': {
      method: 'xnpv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: -1},  // High precision rate
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
  }

  
  /**
   * PMT function - calculates payment for a loan based on constant payments and interest rate.
   */
  public pmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('PMT'),
      (rate: Numeric, periods: Numeric, present: Numeric, future: Numeric, type: Numeric) => {
        return pmtNumeric(rate, periods, present, future, type)
      }
    )
  }

  
  /**
   *
   */
  public ipmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IPMT'), 
      (rate: Numeric, period: Numeric, periods: Numeric, present: Numeric, future: Numeric, type: Numeric) => {
        return ipmtNumeric(rate, period, periods, present, future, type)
      }
    )
  }

  
  /**
   *
   */
  public ppmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('PPMT'), 
      (rate: Numeric, period: Numeric, periods: Numeric, present: Numeric, future: Numeric, type: Numeric) => {
        return ppmtNumeric(rate, period, periods, present, future, type)
      }
    )
  }

  
  /**
   * FV function - calculates future value of an investment.
   */
  public fv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FV'),
      (rate: Numeric, periods: Numeric, payment: Numeric, value: Numeric, type: Numeric) => {
        return fvNumeric(rate, periods, payment, value, type)
      }
    )
  }

  
  /**
   *
   */
  public cumipmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CUMIPMT'),
      (rate: Numeric, periods: Numeric, value: Numeric, startArg: Numeric, endArg: Numeric, type: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const start = startArg.trunc()
        const end = endArg.trunc()
        if (start.greaterThan(end)) {
          return new CellError(ErrorType.NUM, ErrorMessage.EndStartPeriod)
        }
        let acc = factory.zero()
        const one = factory.one()
        const zeroNumeric = factory.zero()
        let i = start
        while (i.lessThanOrEqualTo(end)) {
          acc = acc.plus(ipmtNumeric(rate, i, periods, value, zeroNumeric, type))
          i = i.plus(one)
        }
        return acc
      }
    )
  }

  
  /**
   *
   */
  public cumprinc(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CUMPRINC'),
      (rate: Numeric, periods: Numeric, value: Numeric, startArg: Numeric, endArg: Numeric, type: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const start = startArg.trunc()
        const end = endArg.trunc()
        if (start.greaterThan(end)) {
          return new CellError(ErrorType.NUM, ErrorMessage.EndStartPeriod)
        }
        let acc = factory.zero()
        const one = factory.one()
        const zeroNumeric = factory.zero()
        let i = start
        while (i.lessThanOrEqualTo(end)) {
          acc = acc.plus(ppmtNumeric(rate, i, periods, value, zeroNumeric, type))
          i = i.plus(one)
        }
        return acc
      }
    )
  }

  
  /**
   *
   */
  public db(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('DB'),
      (cost: Numeric, salvage: Numeric, life: Numeric, period: Numeric, month: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        const twelve = factory.fromNumber(12)
        const thousand = factory.fromNumber(1000)
        
        // if ((month === 12 && period > life) || (period > life + 1))
        if ((month.equals(twelve) && period.greaterThan(life)) || period.greaterThan(life.plus(one))) {
          return new CellError(ErrorType.NUM, ErrorMessage.PeriodLong)
        }

        if (salvage.greaterThanOrEqualTo(cost)) {
          return factory.zero()
        }

        // rate = round((1 - (salvage / cost) ^ (1 / life)) * 1000) / 1000
        const rate = one.minus(salvage.dividedBy(cost).pow(one.dividedBy(life))).times(thousand).round().dividedBy(thousand)

        // initial = cost * rate * month / 12
        const initial = cost.times(rate).times(month).dividedBy(twelve)

        if (period.equals(one)) {
          return initial
        }

        let total = initial

        // for (let i = 0; i < period - 2; i++)
        const periodMinusTwo = period.minus(factory.fromNumber(2))
        let i = factory.zero()
        while (i.lessThan(periodMinusTwo)) {
          total = total.plus(cost.minus(total).times(rate))
          i = i.plus(one)
        }
        
        if (period.equals(life.plus(one))) {
          // (cost - total) * rate * (12 - month) / 12
          return cost.minus(total).times(rate).times(twelve.minus(month)).dividedBy(twelve)
        }
        return cost.minus(total).times(rate)
      }
    )
  }

  
  /**
   *
   */
  public ddb(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('DDB'),
      (cost: Numeric, salvage: Numeric, life: Numeric, period: Numeric, factor: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        const zero = factory.zero()
        
        if (period.greaterThan(life)) {
          return new CellError(ErrorType.NUM)
        }
        
        let rate = factor.dividedBy(life)
        let oldValue: Numeric
        
        if (rate.greaterThanOrEqualTo(one)) {
          rate = one
          if (period.equals(one)) {
            oldValue = cost
          } else {
            oldValue = zero
          }
        } else {
          // oldValue = cost * (1 - rate) ^ (period - 1)
          oldValue = cost.times(one.minus(rate).pow(period.minus(one)))
        }
        
        // newValue = cost * (1 - rate) ^ period
        const newValue = cost.times(one.minus(rate).pow(period))
        
        // Math.max(oldValue - Math.max(salvage, newValue), 0)
        const innerMax = salvage.greaterThan(newValue) ? salvage : newValue
        const result = oldValue.minus(innerMax)
        return result.greaterThan(zero) ? result : zero
      }
    )
  }

  
  /**
   *
   */
  public dollarde(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('DOLLARDE'),
      (dollar: Numeric, fractionArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        const ten = factory.fromNumber(10)
        
        if (fractionArg.lessThan(one)) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        
        let fraction = fractionArg.trunc()
        while (fraction.greaterThan(ten)) {
          fraction = fraction.dividedBy(ten)
        }
        
        // Math.trunc(dollar) + (dollar - Math.trunc(dollar)) * 10 / fraction
        const dollarTrunc = dollar.trunc()
        return dollarTrunc.plus(dollar.minus(dollarTrunc).times(ten).dividedBy(fraction))
      }
    )
  }

  
  /**
   *
   */
  public dollarfr(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('DOLLARFR'),
      (dollar: Numeric, fractionArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        const ten = factory.fromNumber(10)
        
        if (fractionArg.lessThan(one)) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        
        let fraction = fractionArg.trunc()
        while (fraction.greaterThan(ten)) {
          fraction = fraction.dividedBy(ten)
        }
        
        // Math.trunc(dollar) + (dollar - Math.trunc(dollar)) * fraction / 10
        const dollarTrunc = dollar.trunc()
        return dollarTrunc.plus(dollar.minus(dollarTrunc).times(fraction).dividedBy(ten))
      }
    )
  }

  
  /**
   *
   */
  public effect(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('EFFECT'),
      (rate: Numeric, periodsArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        const periods = periodsArg.trunc()
        // (1 + rate / periods) ^ periods - 1
        return one.plus(rate.dividedBy(periods)).pow(periods).minus(one)
      }
    )
  }

  
  /**
   *
   */
  public ispmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ISPMT'),
      (rate: Numeric, period: Numeric, periods: Numeric, value: Numeric) => {
        if (periods.isZero()) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // value * rate * (period / periods - 1)
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        return value.times(rate).times(period.dividedBy(periods).minus(one))
      }
    )
  }

  
  /**
   *
   */
  public nominal(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NOMINAL'),
      (rate: Numeric, periodsArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        const periods = periodsArg.trunc()
        // ((rate + 1) ^ (1 / periods) - 1) * periods
        return rate.plus(one).pow(one.dividedBy(periods)).minus(one).times(periods)
      }
    )
  }

  
  /**
   *
   */
  public nper(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NPER'),
      (rate: Numeric, paymentArg: Numeric, present: Numeric, future: Numeric, typeArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        const one = factory.one()
        
        if (rate.isZero()) {
          if (paymentArg.isZero()) {
            return new CellError(ErrorType.DIV_BY_ZERO)
          }
          // (-present - future) / payment
          return present.neg().minus(future).dividedBy(paymentArg)
        }
        
        let payment = paymentArg
        if (!typeArg.isZero()) {
          payment = payment.times(one.plus(rate))
        }
        
        // log((payment - future * rate) / (present * rate + payment)) / log(1 + rate)
        const numerator = payment.minus(future.times(rate))
        const denominator = present.times(rate).plus(payment)
        return numerator.dividedBy(denominator).ln().dividedBy(one.plus(rate).ln())
      }
    )
  }

  
  /**
   *
   */
  public rate(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    // Newton's method: https://en.wikipedia.org/wiki/Newton%27s_method
    return this.runFunction(ast.args, state, this.metadata('RATE'),
      (periods: Numeric, payment: Numeric, present: Numeric, future: Numeric, typeArg: Numeric, guess: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        const one = factory.one()
        const minusOne = factory.fromNumber(-1)
        
        const type = typeArg.isZero() ? zero : one
        
        if (guess.lessThanOrEqualTo(minusOne)) {
          return new CellError(ErrorType.VALUE)
        }

        const epsMax = factory.fromNumber(1e-7)
        const iterMax = 50

        let rate = guess
        for (let iter = 0; iter < iterMax; iter++) {
          if (rate.lessThanOrEqualTo(minusOne)) {
            return new CellError(ErrorType.NUM)
          }
          let y: Numeric
          if (rate.abs().lessThan(epsMax)) {
            // y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future
            y = present.times(one.plus(periods.times(rate)))
              .plus(payment.times(one.plus(rate.times(type))).times(periods))
              .plus(future)
          } else {
            // f = (1 + rate) ^ periods
            const f = one.plus(rate).pow(periods)
            // y = present * f + payment * (1 / rate + type) * (f - 1) + future
            y = present.times(f)
              .plus(payment.times(one.dividedBy(rate).plus(type)).times(f.minus(one)))
              .plus(future)
          }
          if (y.abs().lessThan(epsMax)) {
            return rate
          }
          let dy: Numeric
          if (rate.abs().lessThan(epsMax)) {
            // dy = present * periods + payment * type * periods
            dy = present.times(periods).plus(payment.times(type).times(periods))
          } else {
            // f = (1 + rate) ^ periods
            const f = one.plus(rate).pow(periods)
            // df = periods * (1 + rate) ^ (periods - 1)
            const df = periods.times(one.plus(rate).pow(periods.minus(one)))
            // dy = present * df + payment * (1 / rate + type) * df + payment * (-1 / rate^2) * (f - 1)
            dy = present.times(df)
              .plus(payment.times(one.dividedBy(rate).plus(type)).times(df))
              .plus(payment.times(minusOne.dividedBy(rate.times(rate))).times(f.minus(one)))
          }
          rate = rate.minus(y.dividedBy(dy))
        }
        return new CellError(ErrorType.NUM)
      }
    )
  }

  
  /**
   *
   */
  public pv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('PV'),
      (rate: Numeric, periods: Numeric, payment: Numeric, future: Numeric, typeArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        const one = factory.one()
        const minusOne = factory.fromNumber(-1)
        const type = typeArg.isZero() ? zero : one
        
        if (rate.equals(minusOne)) {
          if (periods.isZero()) {
            return new CellError(ErrorType.NUM)
          } else {
            return new CellError(ErrorType.DIV_BY_ZERO)
          }
        }
        if (rate.isZero()) {
          // -payment * periods - future
          return payment.neg().times(periods).minus(future)
        } else {
          // ((1 - (1 + rate)^periods) * payment * (1 + rate * type) / rate - future) / (1 + rate)^periods
          const onePlusRatePow = one.plus(rate).pow(periods)
          const numerator = one.minus(onePlusRatePow).times(payment).times(one.plus(rate.times(type))).dividedBy(rate).minus(future)
          return numerator.dividedBy(onePlusRatePow)
        }
      }
    )
  }

  
  /**
   *
   */
  public rri(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('RRI'),
      (periods: Numeric, present: Numeric, future: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        const one = factory.one()
        
        if (present.isZero() || (future.isNegative() && present.isPositive()) || (future.isPositive() && present.isNegative())) {
          return new CellError(ErrorType.NUM)
        }

        // (future / present) ^ (1 / periods) - 1
        return future.dividedBy(present).pow(one.dividedBy(periods)).minus(one)
      }
    )
  }

  
  /**
   *
   */
  public sln(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SLN'),
      (cost: Numeric, salvage: Numeric, life: Numeric) => {
        if (life.isZero()) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // (cost - salvage) / life
        return cost.minus(salvage).dividedBy(life)
      }
    )
  }

  
  /**
   *
   */
  public syd(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SYD'),
      (cost: Numeric, salvage: Numeric, life: Numeric, period: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        const two = factory.fromNumber(2)
        
        if (period.greaterThan(life)) {
          return new CellError(ErrorType.NUM)
        }
        // ((cost - salvage) * (life - period + 1) * 2) / (life * (life + 1))
        return cost.minus(salvage).times(life.minus(period).plus(one)).times(two)
          .dividedBy(life.times(life.plus(one)))
      }
    )
  }

  
  /**
   *
   */
  public tbilleq(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('TBILLEQ'),
      (settlementArg: Numeric, maturityArg: Numeric, discount: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        const settlement = settlementArg.round()
        const maturity = maturityArg.round()
        const three60 = factory.fromNumber(360)
        const three65 = factory.fromNumber(365)
        
        if (settlement.greaterThanOrEqualTo(maturity)) {
          return new CellError(ErrorType.NUM)
        }

        // Safe: date serial numbers for DateTimeHelper - dates are integers or have time fraction
        const startDate = this.dateTimeHelper.numberToSimpleDate(settlement.toNumber())
        const endDate = this.dateTimeHelper.numberToSimpleDate(maturity.toNumber())
        if (endDate.year > startDate.year + 1 || (endDate.year === startDate.year + 1 && (endDate.month > startDate.month || (endDate.month === startDate.month && endDate.day > startDate.day)))) {
          return new CellError(ErrorType.NUM)
        }
        
        // denom = 360 - discount * (maturity - settlement)
        const diff = maturity.minus(settlement)
        const denom = three60.minus(discount.times(diff))
        
        if (denom.isZero()) {
          return zero
        }
        if (denom.isNegative()) {
          return new CellError(ErrorType.NUM)
        }
        // 365 * discount / denom
        return three65.times(discount).dividedBy(denom)
      }
    )
  }

  
  /**
   *
   */
  public tbillprice(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('TBILLPRICE'),
      (settlementArg: Numeric, maturityArg: Numeric, discount: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        const settlement = settlementArg.round()
        const maturity = maturityArg.round()
        const three60 = factory.fromNumber(360)
        const hundred = factory.fromNumber(100)
        
        if (settlement.greaterThanOrEqualTo(maturity)) {
          return new CellError(ErrorType.NUM)
        }

        // Safe: date serial numbers for DateTimeHelper - dates are integers or have time fraction
        const startDate = this.dateTimeHelper.numberToSimpleDate(settlement.toNumber())
        const endDate = this.dateTimeHelper.numberToSimpleDate(maturity.toNumber())
        if (endDate.year > startDate.year + 1 || (endDate.year === startDate.year + 1 && (endDate.month > startDate.month || (endDate.month === startDate.month && endDate.day > startDate.day)))) {
          return new CellError(ErrorType.NUM)
        }
        
        const diff = maturity.minus(settlement)
        const denom = three60.minus(discount.times(diff))
        
        if (denom.isZero()) {
          return zero
        }
        if (denom.isNegative()) {
          return new CellError(ErrorType.NUM)
        }
        // 100 * (1 - discount * (maturity - settlement) / 360)
        const one = factory.one()
        return hundred.times(one.minus(discount.times(diff).dividedBy(three60)))
      }
    )
  }

  
  /**
   *
   */
  public tbillyield(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('TBILLYIELD'),
      (settlementArg: Numeric, maturityArg: Numeric, price: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const settlement = settlementArg.round()
        const maturity = maturityArg.round()
        const hundred = factory.fromNumber(100)
        const three60 = factory.fromNumber(360)
        
        if (settlement.greaterThanOrEqualTo(maturity)) {
          return new CellError(ErrorType.NUM)
        }

        // Safe: date serial numbers for DateTimeHelper - dates are integers or have time fraction
        const startDate = this.dateTimeHelper.numberToSimpleDate(settlement.toNumber())
        const endDate = this.dateTimeHelper.numberToSimpleDate(maturity.toNumber())
        if (endDate.year > startDate.year + 1 || (endDate.year === startDate.year + 1 && (endDate.month > startDate.month || (endDate.month === startDate.month && endDate.day > startDate.day)))) {
          return new CellError(ErrorType.NUM)
        }
        
        const diff = maturity.minus(settlement)
        // (100 - price) * 360 / (price * (maturity - settlement))
        return hundred.minus(price).times(three60).dividedBy(price.times(diff))
      }
    )
  }

  
  /**
   *
   */
  public fvschedule(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FVSCHEDULE'),
      (value: Numeric, ratios: SimpleRangeValue) => {
        const factory = NumericProvider.getGlobalFactory()
        const vals = ratios.valuesFromTopLeftCorner()
        for (const val of vals) {
          if (val instanceof CellError) {
            return val
          }
        }
        let result = value
        const one = factory.one()
        for (const val of vals) {
          if (isExtendedNumber(val)) {
            const ratio = getRawPrecisionValue(val)
            result = result.times(one.plus(ratio))
          } else if (val !== EmptyValue) {
            return new CellError(ErrorType.VALUE, ErrorMessage.NumberExpected)
          }
        }
        return result
      })
  }

  
  /**
   *
   */
  public npv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NPV'),
      (rate: Numeric, ...args: RawInterpreterValue[]) => {
        const coercedPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (coercedPrecision instanceof CellError) {
          return coercedPrecision
        }
        const result = npvNumeric(rate, coercedPrecision)
        if (result === null) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        return result
      }
    )
  }

  
  /**
   *
   */
  public mirr(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('MIRR'),
      (range: SimpleRangeValue, frate: Numeric, rrate: Numeric) => {
        const valsPrecision = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner())
        if (valsPrecision instanceof CellError) {
          return valsPrecision
        }
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        const one = factory.one()
        let posFlag = false
        let negFlag = false
        const posValues: Numeric[] = []
        const negValues: Numeric[] = []
        for (const val of valsPrecision) {
          if (val.greaterThan(zero)) {
            posFlag = true
            posValues.push(val)
            negValues.push(zero)
          } else if (val.lessThan(zero)) {
            negFlag = true
            negValues.push(val)
            posValues.push(zero)
          } else {
            negValues.push(zero)
            posValues.push(zero)
          }
        }
        if (!posFlag || !negFlag) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        const n = valsPrecision.length
        const nom = npvNumeric(rrate, posValues)
        if (nom === null) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        const denom = npvNumeric(frate, negValues)
        if (denom === null) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        const onePlusRrate = one.plus(rrate)
        const onePlusFrate = one.plus(frate)
        // (-nom * (1 + rrate)^n / denom / (1 + frate))^(1/(n-1)) - 1
        const numerator = nom.neg().times(onePlusRrate.pow(n))
        const denominator = denom.times(onePlusFrate)
        const base = numerator.dividedBy(denominator)
        const exponent = factory.fromNumber(1 / (n - 1))
        return base.pow(exponent).minus(one)
      }
    )
  }

  
  /**
   *
   */
  public pduration(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('PDURATION'),
      (rate: Numeric, pv: Numeric, fv: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const one = factory.one()
        // (ln(fv) - ln(pv)) / ln(1 + rate)
        return fv.ln().minus(pv.ln()).dividedBy(one.plus(rate).ln())
      }
    )
  }

  
  /**
   *
   */
  public xnpv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('XNPV'),
      (rate: Numeric, values: SimpleRangeValue, dates: SimpleRangeValue) => {
        const factory = NumericProvider.getGlobalFactory()
        const valArr = values.valuesFromTopLeftCorner()
        const valArrNumeric: Numeric[] = []
        for (const val of valArr) {
          if (!isExtendedNumber(val)) {
            return new CellError(ErrorType.VALUE, ErrorMessage.NumberExpected)
          }
          valArrNumeric.push(getRawPrecisionValue(val))
        }
        const dateArr = dates.valuesFromTopLeftCorner()
        const dateArrNumeric: Numeric[] = []
        for (const date of dateArr) {
          if (!isExtendedNumber(date)) {
            return new CellError(ErrorType.VALUE, ErrorMessage.NumberExpected)
          }
          dateArrNumeric.push(getRawPrecisionValue(date).floor())
        }
        if (dateArrNumeric.length !== valArrNumeric.length) {
          return new CellError(ErrorType.NUM, ErrorMessage.EqualLength)
        }
        const n = dateArrNumeric.length
        const zero = factory.zero()
        const one = factory.one()
        if (dateArrNumeric[0].isNegative()) {
          return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
        }
        const onePlusRate = one.plus(rate)
        const daysInYear = factory.fromNumber(365)
        const date0 = dateArrNumeric[0]
        let ret = zero
        for (let i = 0; i < n; i++) {
          if (dateArrNumeric[i].lessThan(date0)) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
          }
          const daysDiff = dateArrNumeric[i].minus(date0)
          const exponent = daysDiff.dividedBy(daysInYear)
          const divisor = onePlusRate.pow(exponent)
          ret = ret.plus(valArrNumeric[i].dividedBy(divisor))
        }
        return ret
      }
    )
  }
}

// ============ HIGH-PRECISION NUMERIC VERSIONS ============

/**
 * PMT calculation using Numeric for high precision.
 */
function pmtNumeric(rate: Numeric, periods: Numeric, present: Numeric, future: Numeric, type: Numeric): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  const zero = factory.zero()
  const one = factory.one()
  
  if (rate.equals(zero)) {
    // (-present - future) / periods
    return present.neg().minus(future).dividedBy(periods)
  } else {
    // term = (1 + rate) ^ periods
    const term = one.plus(rate).pow(periods)
    // (future * rate + present * rate * term) * (type ? 1 / (1 + rate) : 1) / (1 - term)
    const numerator = future.times(rate).plus(present.times(rate).times(term))
    const typeMultiplier = type.equals(zero) ? one : one.dividedBy(one.plus(rate))
    const denominator = one.minus(term)
    return numerator.times(typeMultiplier).dividedBy(denominator)
  }
}

/**
 * FV calculation using Numeric for high precision.
 */
function fvNumeric(rate: Numeric, periods: Numeric, payment: Numeric, value: Numeric, type: Numeric): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  const zero = factory.zero()
  const one = factory.one()
  
  if (rate.equals(zero)) {
    // -value - payment * periods
    return value.neg().minus(payment.times(periods))
  } else {
    // term = (1 + rate) ^ periods
    const term = one.plus(rate).pow(periods)
    // payment * (type ? (1 + rate) : 1) * (1 - term) / rate - value * term
    const typeMultiplier = type.equals(zero) ? one : one.plus(rate)
    return payment.times(typeMultiplier).times(one.minus(term)).dividedBy(rate).minus(value.times(term))
  }
}

/**
 * IPMT calculation using Numeric for high precision.
 */
function ipmtNumeric(rate: Numeric, period: Numeric, periods: Numeric, present: Numeric, future: Numeric, type: Numeric): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  const zero = factory.zero()
  const one = factory.one()
  const two = factory.fromNumber(2)
  
  const payment = pmtNumeric(rate, periods, present, future, type)
  if (period.equals(one)) {
    // rate * (type ? 0 : -present)
    return rate.times(type.equals(zero) ? present.neg() : zero)
  } else {
    if (type.equals(zero)) {
      // rate * fv(rate, period - 1, payment, present, type)
      return rate.times(fvNumeric(rate, period.minus(one), payment, present, type))
    } else {
      // rate * (fv(rate, period - 2, payment, present, type) - payment)
      return rate.times(fvNumeric(rate, period.minus(two), payment, present, type).minus(payment))
    }
  }
}

/**
 * PPMT calculation using Numeric for high precision.
 */
function ppmtNumeric(rate: Numeric, period: Numeric, periods: Numeric, present: Numeric, future: Numeric, type: Numeric): Numeric {
  return pmtNumeric(rate, periods, present, future, type).minus(ipmtNumeric(rate, period, periods, present, future, type))
}
