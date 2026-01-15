/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {Config} from '../Config'
import {Maybe} from '../Maybe'
import {Numeric, NumericProvider} from '../Numeric'
import {ArithmeticHelper} from './ArithmeticHelper'
import {EmptyValue, getRawPrecisionValue, isExtendedNumber, RawScalarValue} from './InterpreterValue'

export enum CriterionType {
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  EQUAL = 'EQUAL',
}

/**
 * Criterion interface using Numeric for high-precision comparisons.
 */
export interface Criterion {
  operator: CriterionType,
  value: Numeric | string | boolean | null,
}

/**
 * Build a criterion with the given operator and value.
 * If value is a number, it will be converted to Numeric for high-precision comparisons.
 */
export const buildCriterion = (operator: CriterionType, value: Numeric | number | string | boolean | null): Criterion => {
  // Convert native number to Numeric for high-precision comparisons
  if (typeof value === 'number') {
    return {operator, value: NumericProvider.getGlobalFactory().fromNumber(value)}
  }
  return {operator, value}
}

/**
 * Type guard to check if criterion value is Numeric
 */
function isNumericValue(value: Numeric | string | boolean | null): value is Numeric {
  return value !== null && typeof value !== 'string' && typeof value !== 'boolean'
}

/**
 *
 */
export class CriterionBuilder {
  private trueString: string
  private falseString: string

  constructor(config: Config) {
    this.trueString = config.translationPackage.getMaybeFunctionTranslation('TRUE')?.toLowerCase() ?? 'true'
    this.falseString = config.translationPackage.getMaybeFunctionTranslation('FALSE')?.toLowerCase() ?? 'false'
  }

  
  /**
   *
   */
  public fromCellValue(raw: RawScalarValue, arithmeticHelper: ArithmeticHelper): Maybe<CriterionPackage> {
    if (typeof raw !== 'string' && typeof raw !== 'boolean' && typeof raw !== 'number') {
      return undefined
    }

    const criterion = this.parseCriterion(raw, arithmeticHelper)
    if (criterion === undefined) {
      return undefined
    }

    return {raw, lambda: buildCriterionLambda(criterion, arithmeticHelper)}
  }

  
  /**
   *
   */
  public parseCriterion(criterion: RawScalarValue, arithmeticHelper: ArithmeticHelper): Maybe<Criterion> {
    if (typeof criterion === 'number') {
      // Convert native number to Numeric for high-precision comparisons
      return buildCriterion(CriterionType.EQUAL, NumericProvider.getGlobalFactory().fromNumber(criterion))
    } else if (typeof criterion === 'boolean') {
      return buildCriterion(CriterionType.EQUAL, criterion)
    } else if (typeof criterion === 'string') {
      const regexResult = ANY_CRITERION_REGEX.exec(criterion)

      let criterionValue
      let criterionType

      if (regexResult) {
        criterionType = StrToCriterionType(regexResult[1])
        criterionValue = regexResult[2]
      } else {
        criterionType = CriterionType.EQUAL
        criterionValue = criterion
      }
      const value = arithmeticHelper.coerceToMaybeNumber(criterionValue)
      const boolvalue = criterionValue.toLowerCase() === this.trueString ? true : criterionValue.toLowerCase() === this.falseString ? false : undefined
      if (criterionType === undefined) {
        return undefined
      }
      if (criterionValue === '') {
        return buildCriterion(criterionType, null)
      } else if (value === undefined) {
        if (criterionType === CriterionType.EQUAL || criterionType === CriterionType.NOT_EQUAL) {
          return buildCriterion(criterionType, boolvalue ?? criterionValue)
        }
      } else {
        // Store Numeric directly for high-precision comparisons
        return buildCriterion(criterionType, getRawPrecisionValue(value))
      }
    }
    return undefined
  }
}

export type CriterionPackage = { raw: string | number | boolean, lambda: CriterionLambda }

const ANY_CRITERION_REGEX = /([<>=]+)(.*)/

/**
 *
 */
function StrToCriterionType(str: string): Maybe<CriterionType> {
  switch (str) {
    case '>':
      return CriterionType.GREATER_THAN
    case '>=':
      return CriterionType.GREATER_THAN_OR_EQUAL
    case '<':
      return CriterionType.LESS_THAN
    case '<=':
      return CriterionType.LESS_THAN_OR_EQUAL
    case '<>':
      return CriterionType.NOT_EQUAL
    case '=':
      return CriterionType.EQUAL
    default:
      return undefined
  }
}

export type CriterionLambda = (cellValue: RawScalarValue) => boolean

/**
 * Build criterion lambda using Numeric comparisons for high precision.
 */
export const buildCriterionLambda = (criterion: Criterion, arithmeticHelper: ArithmeticHelper): CriterionLambda => {
  switch (criterion.operator) {
    case CriterionType.GREATER_THAN: {
      if (isNumericValue(criterion.value)) {
        const criterionNumeric = criterion.value
        return (cellValue) => {
          if (isExtendedNumber(cellValue)) {
            // Use Numeric.comparedTo() for precise comparison
            return getRawPrecisionValue(cellValue).comparedTo(criterionNumeric) > 0
          }
          return false
        }
      } else {
        return (_cellValue) => false
      }
    }
    case CriterionType.GREATER_THAN_OR_EQUAL: {
      if (isNumericValue(criterion.value)) {
        const criterionNumeric = criterion.value
        return (cellValue) => {
          if (isExtendedNumber(cellValue)) {
            return getRawPrecisionValue(cellValue).comparedTo(criterionNumeric) >= 0
          }
          return false
        }
      } else {
        return (_cellValue) => false
      }
    }
    case CriterionType.LESS_THAN: {
      if (isNumericValue(criterion.value)) {
        const criterionNumeric = criterion.value
        return (cellValue) => {
          if (isExtendedNumber(cellValue)) {
            return getRawPrecisionValue(cellValue).comparedTo(criterionNumeric) < 0
          }
          return false
        }
      } else {
        return (_cellValue) => false
      }
    }
    case CriterionType.LESS_THAN_OR_EQUAL: {
      if (isNumericValue(criterion.value)) {
        const criterionNumeric = criterion.value
        return (cellValue) => {
          if (isExtendedNumber(cellValue)) {
            return getRawPrecisionValue(cellValue).comparedTo(criterionNumeric) <= 0
          }
          return false
        }
      } else {
        return (_cellValue) => false
      }
    }
    case CriterionType.EQUAL: {
      if (isNumericValue(criterion.value)) {
        const criterionNumeric = criterion.value
        return (cellValue) => {
          if (isExtendedNumber(cellValue)) {
            return getRawPrecisionValue(cellValue).equals(criterionNumeric)
          } else if (typeof cellValue === 'string') {
            if (cellValue === '') {
              return false
            }
            const val = arithmeticHelper.coerceToMaybeNumber(cellValue)
            if (val === undefined) {
              return false
            }
            return getRawPrecisionValue(val).equals(criterionNumeric)
          } else {
            return false
          }
        }
      } else if (typeof criterion.value === 'string') {
        return arithmeticHelper.eqMatcherFunction(criterion.value)
      } else if (typeof criterion.value === 'boolean') {
        return (cellValue) => (typeof cellValue === 'boolean' && cellValue === criterion.value)
      } else {
        return (cellValue) => (cellValue === EmptyValue)
      }
    }
    case CriterionType.NOT_EQUAL: {
      if (isNumericValue(criterion.value)) {
        const criterionNumeric = criterion.value
        return (cellValue) => {
          if (isExtendedNumber(cellValue)) {
            return !getRawPrecisionValue(cellValue).equals(criterionNumeric)
          } else if (typeof cellValue === 'string') {
            if (cellValue === '') {
              return true
            }
            const val = arithmeticHelper.coerceToMaybeNumber(cellValue)
            if (val === undefined) {
              return true
            }
            return !getRawPrecisionValue(val).equals(criterionNumeric)
          } else {
            return true
          }
        }
      } else if (typeof criterion.value === 'string') {
        return arithmeticHelper.neqMatcherFunction(criterion.value)
      } else if (typeof criterion.value === 'boolean') {
        return (cellValue) => (typeof cellValue !== 'boolean' || cellValue !== criterion.value)
      } else {
        return (cellValue) => (cellValue !== EmptyValue)
      }
    }
  }
}
