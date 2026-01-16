/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue, RawInterpreterValue, isExtendedNumber, getRawPrecisionValue} from '../InterpreterValue'
import {SimpleRangeValue} from '../../SimpleRangeValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {
  NumericProvider,
  gcdArrayNumeric,
  lcmArrayNumeric,
  seriesSumNumeric,
  sumX2MinusY2Numeric,
  sumX2PlusY2Numeric,
  sumXMinusY2Numeric,
  Numeric
} from '../../Numeric'

/**
 *
 */
export class MathPlugin extends FunctionPlugin implements FunctionPluginTypecheck<MathPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'FACT': {
      method: 'fact',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 170}
      ]
    },
    'FACTDOUBLE': {
      method: 'factdouble',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 288}
      ]
    },
    'COMBIN': {
      method: 'combin',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, lessThan: 1030},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0}
      ]
    },
    'COMBINA': {
      method: 'combina',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0}
      ]
    },
    'GCD': {
      method: 'gcd',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1
    },
    'LCM': {
      method: 'lcm',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1
    },
    'MROUND': {
      method: 'mround',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
    'MULTINOMIAL': {
      method: 'multinomial',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
      repeatLastArgs: 1,
      expandRanges: true,
    },
    'QUOTIENT': {
      method: 'quotient',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
    'SERIESSUM': {
      method: 'seriessum',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'SIGN': {
      method: 'sign',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
    'SUMX2MY2': {
      method: 'sumx2my2',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'SUMX2PY2': {
      method: 'sumx2py2',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'SUMXMY2': {
      method: 'sumxmy2',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
  }

  
  /**
   *
   */
  public fact(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FACT'),
      (argNumeric: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const argTrunc = argNumeric.trunc()
        let ret = factory.one()
        let i = factory.one()
        const one = factory.one()
        while (i.lessThanOrEqualTo(argTrunc)) {
          ret = ret.times(i)
          i = i.plus(one)
        }
        return ret
      })
  }

  
  /**
   *
   */
  public factdouble(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FACTDOUBLE'),
      (argNumeric: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const argTrunc = argNumeric.trunc()
        let ret = factory.one()
        const one = factory.one()
        const two = factory.fromNumber(2)
        let i = argTrunc
        while (i.greaterThanOrEqualTo(one)) {
          ret = ret.times(i)
          i = i.minus(two)
        }
        return ret
      }
    )
  }

  
  /**
   *
   */
  public combin(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COMBIN'),
      (nArg: Numeric, mArg: Numeric) => {
        if (mArg.greaterThan(nArg)) {
          return new CellError(ErrorType.NUM, ErrorMessage.WrongOrder)
        }
        const n = nArg.trunc()
        const m = mArg.trunc()
        return combinNumeric(n, m)
      })
  }

  
  /**
   *
   */
  public combina(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COMBINA'),
      (nArg: Numeric, mArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const n = nArg.trunc()
        const m = mArg.trunc()
        const limit = factory.fromNumber(1030)
        // n + m - 1 >= 1030
        if (n.plus(m).minus(factory.one()).greaterThanOrEqualTo(limit)) {
          //Product #2 does not enforce this
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        if (n.isZero() && m.isZero()) {
          return factory.one()
        }
        return combinNumeric(n.plus(m).minus(factory.one()), m)
      }
    )
  }

  
  /**
   *
   */
  public gcd(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('GCD'),
      (...args: RawInterpreterValue[]) => {
        const processedArgsPrecision = this.arithmeticHelper.coerceNumbersCoerceRangesDropNulls(args)
        if (processedArgsPrecision instanceof CellError) {
          return processedArgsPrecision
        }
        for (const val of processedArgsPrecision) {
          if (val.isNegative()) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
          }
        }
        const result = gcdArrayNumeric(processedArgsPrecision)
        // Check MAX_SAFE_INTEGER using Numeric comparison
        const maxSafeNumeric = NumericProvider.getGlobalFactory().fromNumber(Number.MAX_SAFE_INTEGER)
        if (result.greaterThan(maxSafeNumeric)) {
          //inconsistency with product #1
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return result
      }
    )
  }

  
  /**
   *
   */
  public lcm(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('LCM'),
      (...args: RawInterpreterValue[]) => {
        const processedArgsPrecision = this.arithmeticHelper.coerceNumbersCoerceRangesDropNulls(args)
        if (processedArgsPrecision instanceof CellError) {
          return processedArgsPrecision
        }
        for (const val of processedArgsPrecision) {
          if (val.isNegative()) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
          }
        }
        const result = lcmArrayNumeric(processedArgsPrecision)
        // Check MAX_SAFE_INTEGER using Numeric comparison
        const maxSafeNumeric = NumericProvider.getGlobalFactory().fromNumber(Number.MAX_SAFE_INTEGER)
        if (result.greaterThan(maxSafeNumeric)) {
          //inconsistency with product #1
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return result
      }
    )
  }

  
  /**
   *
   */
  public mround(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('MROUND'),
      (nomArg: Numeric, denomArg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        if (denomArg.isZero()) {
          return zero
        }
        // Check if signs are different (nom > 0 && denom < 0) || (nom < 0 && denom > 0)
        if ((nomArg.isPositive() && denomArg.isNegative()) || (nomArg.isNegative() && denomArg.isPositive())) {
          return new CellError(ErrorType.NUM, ErrorMessage.DistinctSigns)
        }
        // Math.round(nom / denom) * denom
        return nomArg.dividedBy(denomArg).round().times(denomArg)
      }
    )
  }

  
  /**
   *
   */
  public multinomial(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('MULTINOMIAL'),
      (...argsNumeric: Numeric[]) => {
        const factory = NumericProvider.getGlobalFactory()
        let n = factory.zero()
        let ans = factory.one()
        const one = factory.one()
        for (const argNumeric of argsNumeric) {
          if (argNumeric.isNegative()) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
          }
          const arg = argNumeric.trunc()
          let i = one
          while (i.lessThanOrEqualTo(arg)) {
            // ans *= (n + i) / i
            ans = ans.times(n.plus(i)).dividedBy(i)
            i = i.plus(one)
          }
          n = n.plus(arg)
        }
        return ans.round()
      }
    )
  }

  
  /**
   *
   */
  public quotient(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('QUOTIENT'),
      (nomArg: Numeric, denomArg: Numeric) => {
        if (denomArg.isZero()) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // Math.trunc(nom / denom)
        return nomArg.dividedBy(denomArg).trunc()
      }
    )
  }

  
  /**
   *
   */
  public seriessum(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SERIESSUM'),
      (xArg: Numeric, nArg: Numeric, mArg: Numeric, range: SimpleRangeValue) => {
        const coefsPrecision = this.arithmeticHelper.manyToOnlyNumbersDropNulls(range.valuesFromTopLeftCorner())
        if (coefsPrecision instanceof CellError) {
          return coefsPrecision
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return seriesSumNumeric(xArg, nArg, mArg, coefsPrecision)
      }
    )
  }

  
  /**
   *
   */
  public sign(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SIGN'),
      (argNumeric: Numeric) => {
        // Check isZero first since isPositive might return true for 0 in some implementations
        if (argNumeric.isZero()) {
          return 0
        } else if (argNumeric.isPositive()) {
          return 1
        } else {
          return -1
        }
      }
    )
  }

  
  /**
   *
   */
  public sumx2my2(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SUMX2MY2'),
      (rangeX: SimpleRangeValue, rangeY: SimpleRangeValue) => {
        const valsX = rangeX.valuesFromTopLeftCorner()
        const valsY = rangeY.valuesFromTopLeftCorner()
        if (valsX.length !== valsY.length) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }
        const arrX: Numeric[] = []
        const arrY: Numeric[] = []
        for (let i = 0; i < valsX.length; i++) {
          const valX = valsX[i]
          const valY = valsY[i]
          if (valX instanceof CellError) {
            return valX
          }
          if (valY instanceof CellError) {
            return valY
          }
          if (isExtendedNumber(valX) && isExtendedNumber(valY)) {
            arrX.push(getRawPrecisionValue(valX))
            arrY.push(getRawPrecisionValue(valY))
          }
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return sumX2MinusY2Numeric(arrX, arrY)
      }
    )
  }

  
  /**
   *
   */
  public sumx2py2(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SUMX2PY2'),
      (rangeX: SimpleRangeValue, rangeY: SimpleRangeValue) => {
        const valsX = rangeX.valuesFromTopLeftCorner()
        const valsY = rangeY.valuesFromTopLeftCorner()
        if (valsX.length !== valsY.length) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }
        const arrX: Numeric[] = []
        const arrY: Numeric[] = []
        for (let i = 0; i < valsX.length; i++) {
          const valX = valsX[i]
          const valY = valsY[i]
          if (valX instanceof CellError) {
            return valX
          }
          if (valY instanceof CellError) {
            return valY
          }
          if (isExtendedNumber(valX) && isExtendedNumber(valY)) {
            arrX.push(getRawPrecisionValue(valX))
            arrY.push(getRawPrecisionValue(valY))
          }
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return sumX2PlusY2Numeric(arrX, arrY)
      }
    )
  }

  
  /**
   *
   */
  public sumxmy2(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SUMXMY2'),
      (rangeX: SimpleRangeValue, rangeY: SimpleRangeValue) => {
        const valsX = rangeX.valuesFromTopLeftCorner()
        const valsY = rangeY.valuesFromTopLeftCorner()
        if (valsX.length !== valsY.length) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }
        const arrX: Numeric[] = []
        const arrY: Numeric[] = []
        for (let i = 0; i < valsX.length; i++) {
          const valX = valsX[i]
          const valY = valsY[i]
          if (valX instanceof CellError) {
            return valX
          }
          if (valY instanceof CellError) {
            return valY
          }
          if (isExtendedNumber(valX) && isExtendedNumber(valY)) {
            arrX.push(getRawPrecisionValue(valX))
            arrY.push(getRawPrecisionValue(valY))
          }
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return sumXMinusY2Numeric(arrX, arrY)
      }
    )
  }
}

/**
 * Combination using Numeric for high precision
 */
function combinNumeric(n: Numeric, m: Numeric): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  const two = factory.fromNumber(2)
  // if 2 * m > n, use m = n - m for optimization
  if (two.times(m).greaterThan(n)) {
    m = n.minus(m)
  }
  let ret = factory.one()
  const one = factory.one()
  let i = one
  while (i.lessThanOrEqualTo(m)) {
    // ret *= (n - m + i) / i
    ret = ret.times(n.minus(m).plus(i)).dividedBy(i)
    i = i.plus(one)
  }
  return ret.round()
}
