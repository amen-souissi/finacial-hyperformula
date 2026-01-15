/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {
  getRawPrecisionValue,
  InternalScalarValue,
  InterpreterValue,
  isExtendedNumber,
  RawInterpreterValue,
} from '../InterpreterValue'
import {SimpleRangeValue} from '../../SimpleRangeValue'
import {
  centralF,
  chisquare,
  corrcoeff,
  covariance,
  mean,
  normal,
  stdev,
  studentt,
  sumsqerr,
  variance
} from './3rdparty/jstat/jstat'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {
  Numeric,
  NumericProvider,
  avedevNumeric,
  sumSquaredErrorsNumeric,
  geomeanNumeric,
  harmeanNumeric,
  skewnessNumeric,
  stdDevNumeric
} from '../../Numeric'

/**
 *
 */
export class StatisticalAggregationPlugin extends FunctionPlugin implements FunctionPluginTypecheck<StatisticalAggregationPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'AVEDEV': {
      method: 'avedev',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'DEVSQ': {
      method: 'devsq',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'GEOMEAN': {
      method: 'geomean',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'HARMEAN': {
      method: 'harmean',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'CORREL': {
      method: 'correl',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'RSQ': {
      method: 'rsq',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'COVARIANCE.P': {
      method: 'covariancep',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'COVARIANCE.S': {
      method: 'covariances',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'Z.TEST': {
      method: 'ztest',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, optionalArg: true},
      ],
    },
    'F.TEST': {
      method: 'ftest',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'STEYX': {
      method: 'steyx',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'SLOPE': {
      method: 'slope',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'CHISQ.TEST': {
      method: 'chisqtest',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
      ],
    },
    'T.TEST': {
      method: 'ttest',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.INTEGER, minValue: 1, maxValue: 2},
        {argumentType: FunctionArgumentType.INTEGER, minValue: 1, maxValue: 3},
      ],
    },
    'SKEW': {
      method: 'skew',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'SKEW.P': {
      method: 'skewp',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
  }
  public static aliases = {
    COVAR: 'COVARIANCE.P',
    FTEST: 'F.TEST',
    PEARSON: 'CORREL',
    ZTEST: 'Z.TEST',
    CHITEST: 'CHISQ.TEST',
    TTEST: 'T.TEST',
    COVARIANCEP: 'COVARIANCE.P',
    COVARIANCES: 'COVARIANCE.S',
    SKEWP: 'SKEW.P',
  }

  
  /**
   *
   */
  public avedev(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('AVEDEV'),
      (...args: RawInterpreterValue[]) => {
        const coercedPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (coercedPrecision instanceof CellError) {
          return coercedPrecision
        }
        if (coercedPrecision.length === 0) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return avedevNumeric(coercedPrecision)
      })
  }

  
  /**
   *
   */
  public devsq(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('DEVSQ'),
      (...args: RawInterpreterValue[]) => {
        const coercedPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (coercedPrecision instanceof CellError) {
          return coercedPrecision
        }
        if (coercedPrecision.length === 0) {
          return 0
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return sumSquaredErrorsNumeric(coercedPrecision)
      })
  }

  
  /**
   *
   */
  public geomean(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('GEOMEAN'),
      (...args: RawInterpreterValue[]) => {
        const coercedPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (coercedPrecision instanceof CellError) {
          return coercedPrecision
        }
        if (coercedPrecision.length === 0) {
          return new CellError(ErrorType.NUM, ErrorMessage.OneValue)
        }
        const zero = NumericProvider.getGlobalFactory().zero()
        for (const val of coercedPrecision) {
          if (val.lessThanOrEqualTo(zero)) { // val <= 0
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
          }
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return geomeanNumeric(coercedPrecision)
      })
  }

  
  /**
   *
   */
  public harmean(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('HARMEAN'),
      (...args: RawInterpreterValue[]) => {
        const coercedPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (coercedPrecision instanceof CellError) {
          return coercedPrecision
        }
        if (coercedPrecision.length === 0) {
          return new CellError(ErrorType.NUM, ErrorMessage.OneValue)
        }
        const zero = NumericProvider.getGlobalFactory().zero()
        for (const val of coercedPrecision) {
          if (val.lessThanOrEqualTo(zero)) { // val <= 0
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
          }
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return harmeanNumeric(coercedPrecision)
      })
  }

  
  /**
   *
   */
  public correl(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CORREL'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        if (dataX.numberOfElements() !== dataY.numberOfElements()) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }
        const ret = parseTwoArrays(dataX, dataY)
        if (ret instanceof CellError) {
          return ret
        }
        const n = ret[0].length
        if (n <= 1) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
        }
        const [arrX, arrY] = toNativeArrays(ret)
        return corrcoeff(arrX, arrY)
      })
  }

  
  /**
   *
   */
  public rsq(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('RSQ'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        if (dataX.numberOfElements() !== dataY.numberOfElements()) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }

        const ret = parseTwoArrays(dataX, dataY)
        if (ret instanceof CellError) {
          return ret
        }
        const n = ret[0].length
        if (n <= 1) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
        }
        const [arrX, arrY] = toNativeArrays(ret)
        return Math.pow(corrcoeff(arrX, arrY), 2)
      })
  }

  
  /**
   *
   */
  public covariancep(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COVARIANCE.P'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        if (dataX.numberOfElements() !== dataY.numberOfElements()) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }

        const ret = parseTwoArrays(dataX, dataY)
        if (ret instanceof CellError) {
          return ret
        }
        const n = ret[0].length
        if (n < 1) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.OneValue)
        }
        if (n === 1) {
          return 0
        }
        const [arrX, arrY] = toNativeArrays(ret)
        return covariance(arrX, arrY) * (n - 1) / n
      })
  }

  
  /**
   *
   */
  public covariances(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COVARIANCE.S'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        if (dataX.numberOfElements() !== dataY.numberOfElements()) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }

        const ret = parseTwoArrays(dataX, dataY)
        if (ret instanceof CellError) {
          return ret
        }
        const n = ret[0].length
        if (n <= 1) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
        }
        const [arrX, arrY] = toNativeArrays(ret)
        return covariance(arrX, arrY)
      })
  }

  
  /**
   *
   */
  public ztest(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('Z.TEST'),
      (range: SimpleRangeValue, xArg: Numeric, sigmaArg?: Numeric) => {
        const valsPrecision = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner())
        if (valsPrecision instanceof CellError) {
          return valsPrecision
        }
        const x = xArg.toNumber()
        let sigma = sigmaArg?.toNumber()
        const n = valsPrecision.length
        // JSTAT COMPATIBILITY: Statistical distribution functions (normal.cdf) require native number[].
        // This conversion may lose precision, but is necessary for the jstat library.
        // Future improvement: Implement native Numeric distribution functions.
        const vals = valsPrecision.map(v => v.toNumber())  // Required: jstat library compatibility
        if (sigma === undefined) {
          if (n < 2) {
            return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
          }
          sigma = stdev(vals, true)
        }
        if (n < 1) {
          return new CellError(ErrorType.NA, ErrorMessage.OneValue)
        }
        if (sigma === 0) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        return 1 - normal.cdf((mean(vals) - x) / (sigma / Math.sqrt(n)), 0, 1)
      }
    )
  }

  
  /**
   *
   */
  public ftest(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('F.TEST'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        const arrXPrecision = this.arithmeticHelper.manyToExactNumbers(dataX.valuesFromTopLeftCorner())
        const arrYPrecision = this.arithmeticHelper.manyToExactNumbers(dataY.valuesFromTopLeftCorner())
        if (arrXPrecision instanceof CellError) {
          return arrXPrecision
        }
        if (arrYPrecision instanceof CellError) {
          return arrYPrecision
        }
        if (arrXPrecision.length <= 1 || arrYPrecision.length <= 1) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // JSTAT COMPATIBILITY: F-distribution (centralF.cdf) requires native number[].
        // This conversion may lose precision, but is necessary for the jstat library.
        const arrX = arrXPrecision.map(v => v.toNumber())  // Required: jstat library compatibility
        const arrY = arrYPrecision.map(v => v.toNumber())  // Required: jstat library compatibility
        const vx = variance(arrX, true)
        const vy = variance(arrY, true)
        if (vx === 0 || vy === 0) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        const r = vx / vy
        const v = centralF.cdf(r, arrX.length - 1, arrY.length - 1)
        return 2 * Math.min(v, 1 - v)
      })
  }

  
  /**
   *
   */
  public steyx(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('STEYX'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        if (dataX.numberOfElements() !== dataY.numberOfElements()) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }

        const ret = parseTwoArrays(dataX, dataY)
        if (ret instanceof CellError) {
          return ret
        }
        const n = ret[0].length
        if (n <= 2) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.ThreeValues)
        }
        const [arrX, arrY] = toNativeArrays(ret)
        return Math.sqrt((sumsqerr(arrX) - Math.pow(covariance(arrX, arrY) * (n - 1), 2) / sumsqerr(arrY)) / (n - 2))
      })
  }

  
  /**
   *
   */
  public slope(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SLOPE'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        if (dataX.numberOfElements() !== dataY.numberOfElements()) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }

        const ret = parseTwoArrays(dataX, dataY)
        if (ret instanceof CellError) {
          return ret
        }
        const n = ret[0].length
        if (n <= 1) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
        }
        const [arrX, arrY] = toNativeArrays(ret)
        return covariance(arrX, arrY) * (n - 1) / sumsqerr(arrY)
      })
  }

  
  /**
   *
   */
  public chisqtest(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.TEST'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue) => {
        const r = dataX.height()
        const c = dataX.width()
        if (dataY.height() !== r || dataY.width() !== c) {
          return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
        }

        const ret = parseTwoArrays(dataX, dataY)
        if (ret instanceof CellError) {
          return ret
        }
        if (ret[0].length <= 1) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
        }
        const [arrX, arrY] = toNativeArrays(ret)
        let sum = 0
        for (let i = 0; i < arrX.length; i++) {
          if (arrY[i] === 0) {
            return new CellError(ErrorType.DIV_BY_ZERO)
          }
          sum += Math.pow(arrX[i] - arrY[i], 2) / arrY[i]
        }
        if (sum < 0) {
          return new CellError(ErrorType.NUM, ErrorMessage.NaN)
        }
        return 1 - chisquare.cdf(sum, (r > 1 && c > 1) ? (r - 1) * (c - 1) : r * c - 1)
      })
  }

  
  /**
   *
   */
  public ttest(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('T.TEST'),
      (dataX: SimpleRangeValue, dataY: SimpleRangeValue, tails: number, type: number) => {
        const arrXPrecision = this.arithmeticHelper.manyToExactNumbers(dataX.valuesFromTopLeftCorner())
        const arrYPrecision = this.arithmeticHelper.manyToExactNumbers(dataY.valuesFromTopLeftCorner())
        if (arrXPrecision instanceof CellError) {
          return arrXPrecision
        }
        if (arrYPrecision instanceof CellError) {
          return arrYPrecision
        }
        const n = arrXPrecision.length
        const m = arrYPrecision.length
        // JSTAT COMPATIBILITY: Student's t-distribution (studentt.cdf) requires native number[].
        // This conversion may lose precision, but is necessary for the jstat library.
        const arrX = arrXPrecision.map(v => v.toNumber())  // Required: jstat library compatibility
        const arrY = arrYPrecision.map(v => v.toNumber())  // Required: jstat library compatibility
        if (type === 1) {
          if (m !== n) {
            return new CellError(ErrorType.NA, ErrorMessage.EqualLength)
          }
          if (n <= 1) {
            return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
          }
          const sub: number[] = Array(n)
          for (let i = 0; i < n; i++) {
            sub[i] = arrX[i] - arrY[i]
          }
          const s = stdev(sub, true)
          if (s === 0) {
            return new CellError(ErrorType.DIV_BY_ZERO)
          }
          const t = Math.abs(Math.sqrt(n) * mean(sub) / s)
          return tails * (1 - studentt.cdf(t, n - 1))
        } else if (type === 2) {
          if (n <= 1 || m <= 1) {
            return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
          }
          const s = (sumsqerr(arrX) + sumsqerr(arrY)) / (n + m - 2)
          if (s === 0) {
            return new CellError(ErrorType.DIV_BY_ZERO)
          }
          const t = Math.abs((mean(arrX) - mean(arrY)) / Math.sqrt(s * (1 / n + 1 / m)))
          return tails * (1 - studentt.cdf(t, n + m - 2))
        } else {//type === 3
          if (n <= 1 || m <= 1) {
            return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues)
          }
          const sx = variance(arrX, true)
          const sy = variance(arrY, true)
          if (sx === 0 && sy === 0) {
            return new CellError(ErrorType.DIV_BY_ZERO)
          }
          const t = Math.abs((mean(arrX) - mean(arrY)) / Math.sqrt(sx / n + sy / m))
          const v = Math.pow(sx / n + sy / m, 2) / (Math.pow(sx / n, 2) / (n - 1) + Math.pow(sy / m, 2) / (m - 1))
          return tails * (1 - studentt.cdf(t, v))
        }
      })
  }

  
  /**
   *
   */
  public skew(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SKEW'),
      (...args: RawInterpreterValue[]) => {
        const coercedPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (coercedPrecision instanceof CellError) {
          return coercedPrecision
        }
        const n = coercedPrecision.length
        if (n < 3) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.ThreeValues)
        }
        // Use Numeric for high-precision skewness calculation
        const s = stdDevNumeric(coercedPrecision, true)
        if (s.equals(NumericProvider.getGlobalFactory().zero())) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // Return Numeric directly - conversion happens at output (Exporter)
        return skewnessNumeric(coercedPrecision, true)
      })
  }

  
  /**
   *
   */
  public skewp(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SKEW.P'),
      (...args: RawInterpreterValue[]) => {
        const coercedPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (coercedPrecision instanceof CellError) {
          return coercedPrecision
        }
        const n = coercedPrecision.length
        if (n < 3) {
          return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.ThreeValues)
        }
        // Use Numeric for high-precision skewness calculation
        const s = stdDevNumeric(coercedPrecision, false)
        if (s.equals(NumericProvider.getGlobalFactory().zero())) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // Return Numeric directly - conversion happens at output (Exporter)
        return skewnessNumeric(coercedPrecision, false)
      })
  }
}

/**
 * Parses two ranges into paired arrays of Numeric values.
 * Used for correlation, covariance, and other statistical functions.
 */
function parseTwoArrays(dataX: SimpleRangeValue, dataY: SimpleRangeValue): CellError | [Numeric[], Numeric[]] {
  const xit = dataX.iterateValuesFromTopLeftCorner()
  const yit = dataY.iterateValuesFromTopLeftCorner()
  let x, y
  const arrX: Numeric[] = []
  const arrY: Numeric[] = []
  while (x = xit.next(), y = yit.next(), !x.done && !y.done) {
    const xval: InternalScalarValue = x.value
    const yval: InternalScalarValue = y.value
    if (xval instanceof CellError) {
      return xval
    } else if (yval instanceof CellError) {
      return yval
    } else if (isExtendedNumber(xval) && isExtendedNumber(yval)) {
      arrX.push(getRawPrecisionValue(xval))
      arrY.push(getRawPrecisionValue(yval))
    }
  }
  return [arrX, arrY]
}

/**
 * Converts Numeric arrays to native number arrays for jstat library compatibility.
 * 
 * JSTAT COMPATIBILITY: The jstat library only accepts number[].
 * This conversion may lose precision, but is necessary for jstat functions
 * (variance, mean, stdev, corrcoeff, etc.).
 * 
 * Future improvement: Implement native Numeric versions of these statistical functions.
 */
function toNativeArrays(arrays: [Numeric[], Numeric[]]): [number[], number[]] {
  return [
    arrays[0].map(v => v.toNumber()),  // Required: jstat library compatibility
    arrays[1].map(v => v.toNumber())   // Required: jstat library compatibility
  ]
}
