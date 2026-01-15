/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue} from '../InterpreterValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric, NumericProvider, RoundingMode} from '../../Numeric'

/**
 * Find the next odd number >= arg (ceiling to odd)
 */
export function findNextOddNumberNumeric(arg: Numeric): Numeric {
  const ceiled = arg.ceil()
  const factory = NumericProvider.getGlobalFactory()
  const two = factory.fromNumber(2)
  const one = factory.one()
  // Check if ceiled is odd (ceiled % 2 === 1 or ceiled % 2 === -1)
  const mod = ceiled.mod(two)
  if (mod.abs().equals(one)) {
    return ceiled
  }
  return ceiled.plus(one)
}

/**
 * Find the next even number >= arg (ceiling to even)
 */
export function findNextEvenNumberNumeric(arg: Numeric): Numeric {
  const ceiled = arg.ceil()
  const factory = NumericProvider.getGlobalFactory()
  const two = factory.fromNumber(2)
  const one = factory.one()
  // Check if ceiled is even (ceiled % 2 === 0)
  if (ceiled.mod(two).isZero()) {
    return ceiled
  }
  return ceiled.plus(one)
}

// Legacy functions kept for backward compatibility
/**
 *
 */
export function findNextOddNumber(arg: number): number {
  const ceiled = Math.ceil(arg)
  return (ceiled % 2 === 1) ? ceiled : ceiled + 1
}

/**
 *
 */
export function findNextEvenNumber(arg: number): number {
  const ceiled = Math.ceil(arg)
  return (ceiled % 2 === 0) ? ceiled : ceiled + 1
}

/**
 *
 */
export class RoundingPlugin extends FunctionPlugin implements FunctionPluginTypecheck<RoundingPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'ROUNDUP': {
      method: 'roundup',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
    },
    'ROUNDDOWN': {
      method: 'rounddown',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
    },
    'ROUND': {
      method: 'round',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
    },
    'INT': {
      method: 'intFunc',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ],
    },
    'EVEN': {
      method: 'even',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ],
    },
    'ODD': {
      method: 'odd',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ],
    },
    'CEILING.MATH': {
      method: 'ceilingmath',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
    },
    'CEILING': {
      method: 'ceiling',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
    'CEILING.PRECISE': {
      method: 'ceilingprecise',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 1},
      ],
    },
    'FLOOR.MATH': {
      method: 'floormath',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ],
    },
    'FLOOR': {
      method: 'floor',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
    'FLOOR.PRECISE': {
      method: 'floorprecise',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 1},
      ],
    },
  }

  public static aliases = {
    'ISO.CEILING': 'CEILING.PRECISE',
    'TRUNC': 'ROUNDDOWN',
  }

  
  /**
   * ROUNDUP - Rounds away from zero
   */
  public roundup(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ROUNDDOWN'), (numberToRound: Numeric, placesArg: Numeric): Numeric => {
      const places = placesArg.trunc().toNumber()  // Safe: places is integer for decimal positioning
      // ROUNDUP rounds away from zero
      if (places >= 0) {
        return numberToRound.toDecimalPlaces(places, RoundingMode.ROUND_UP)
      } else {
        // For negative places, multiply/round/divide to handle powers of 10
        const factory = NumericProvider.getGlobalFactory()
        const multiplier = factory.fromNumber(10).pow(-places)
        // Round away from zero: use ceil for positive, floor for negative
        const divided = numberToRound.dividedBy(multiplier)
        const rounded = numberToRound.isNegative() ? divided.floor() : divided.ceil()
        return rounded.times(multiplier)
      }
    })
  }

  
  /**
   * ROUNDDOWN - Rounds toward zero (truncate)
   */
  public rounddown(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ROUNDDOWN'), (numberToRound: Numeric, placesArg: Numeric): Numeric => {
      const places = placesArg.trunc().toNumber()  // Safe: places is integer for decimal positioning
      // ROUNDDOWN rounds toward zero (truncate)
      if (places >= 0) {
        return numberToRound.toDecimalPlaces(places, RoundingMode.ROUND_DOWN)
      } else {
        // For negative places, multiply/round/divide to handle powers of 10
        const factory = NumericProvider.getGlobalFactory()
        const multiplier = factory.fromNumber(10).pow(-places)
        return numberToRound.dividedBy(multiplier).trunc().times(multiplier)
      }
    })
  }

  
  /**
   * ROUND - Standard rounding (half away from zero)
   */
  public round(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ROUND'), (numberToRound: Numeric, placesArg: Numeric): Numeric => {
      const places = placesArg.trunc().toNumber()  // Safe: places is integer for decimal positioning
      // ROUND uses half-up rounding (standard)
      if (places >= 0) {
        return numberToRound.toDecimalPlaces(places, RoundingMode.ROUND_HALF_UP)
      } else {
        // For negative places, multiply/round/divide to handle powers of 10
        const factory = NumericProvider.getGlobalFactory()
        const multiplier = factory.fromNumber(10).pow(-places)
        return numberToRound.dividedBy(multiplier).round().times(multiplier)
      }
    })
  }

  
  /**
   * INT - Rounds down toward negative infinity (floor) for positive numbers
   * but uses trunc for negative numbers to maintain Excel compatibility
   */
  public intFunc(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('INT'), (numberToRound: Numeric): Numeric => {
      // Historical behavior: INT(-1.5) = -1 (trunc toward zero), not -2 (floor)
      // This matches HyperFormula's established behavior for backward compatibility
      if (numberToRound.isNegative()) {
        return numberToRound.neg().floor().neg()
      } else {
        return numberToRound.floor()
      }
    })
  }

  
  /**
   * EVEN - Rounds up to the nearest even number (away from zero)
   */
  public even(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('EVEN'), (numberToRound: Numeric): Numeric => {
      if (numberToRound.isNegative()) {
        return findNextEvenNumberNumeric(numberToRound.neg()).neg()
      } else {
        return findNextEvenNumberNumeric(numberToRound)
      }
    })
  }

  
  /**
   * ODD - Rounds up to the nearest odd number (away from zero)
   */
  public odd(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ODD'), (numberToRound: Numeric): Numeric => {
      if (numberToRound.isNegative()) {
        return findNextOddNumberNumeric(numberToRound.neg()).neg()
      } else {
        return findNextOddNumberNumeric(numberToRound)
      }
    })
  }

  
  /**
   * CEILING.MATH - Rounds up to the nearest multiple of significance
   */
  public ceilingmath(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CEILING.MATH'),
      (value: Numeric, significanceArg: Numeric, modeArg: Numeric): Numeric | number => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        
        if (significanceArg.isZero() || value.isZero()) {
          return zero
        }

        let significance = significanceArg.abs()
        const mode = modeArg.trunc()
        
        // If mode is 1 and value is negative, use negative significance (round toward zero)
        if (mode.equals(factory.one()) && value.isNegative()) {
          significance = significance.neg()
        }

        // ceil(value / significance) * significance
        return value.dividedBy(significance).ceil().times(significance)
      })
  }

  
  /**
   * CEILING - Rounds up to the nearest multiple of significance
   */
  public ceiling(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CEILING'),
      (value: Numeric, significance: Numeric): Numeric | CellError | number => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        
        if (value.isZero()) {
          return zero
        }
        if (significance.isZero()) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }

        if (value.isPositive() && significance.isNegative()) {
          return new CellError(ErrorType.NUM, ErrorMessage.DistinctSigns)
        }

        // ceil(value / significance) * significance
        return value.dividedBy(significance).ceil().times(significance)
      })
  }

  
  /**
   * CEILING.PRECISE - Rounds up to the nearest multiple of significance (absolute)
   */
  public ceilingprecise(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CEILING.PRECISE'),
      (value: Numeric, significanceArg: Numeric): Numeric | number => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        
        if (significanceArg.isZero() || value.isZero()) {
          return zero
        }
        
        const significance = significanceArg.abs()
        // ceil(value / significance) * significance
        return value.dividedBy(significance).ceil().times(significance)
      })
  }

  
  /**
   * FLOOR.MATH - Rounds down to the nearest multiple of significance
   */
  public floormath(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FLOOR.MATH'),
      (value: Numeric, significanceArg: Numeric, modeArg: Numeric): Numeric | number => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        
        if (significanceArg.isZero() || value.isZero()) {
          return zero
        }

        let significance = significanceArg.abs()
        const mode = modeArg.trunc()
        
        // If mode is 1 and value is negative, use negative significance (round toward zero)
        if (mode.equals(factory.one()) && value.isNegative()) {
          significance = significance.neg()
        }

        // floor(value / significance) * significance
        return value.dividedBy(significance).floor().times(significance)
      })
  }

  
  /**
   * FLOOR - Rounds down to the nearest multiple of significance
   */
  public floor(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FLOOR'),
      (value: Numeric, significance: Numeric): Numeric | CellError | number => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        
        if (value.isZero()) {
          return zero
        }
        if (significance.isZero()) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }

        if (value.isPositive() && significance.isNegative()) {
          return new CellError(ErrorType.NUM, ErrorMessage.DistinctSigns)
        }

        // floor(value / significance) * significance
        return value.dividedBy(significance).floor().times(significance)
      })
  }

  
  /**
   * FLOOR.PRECISE - Rounds down to the nearest multiple of significance (absolute)
   */
  public floorprecise(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FLOOR.PRECISE'),
      (value: Numeric, significanceArg: Numeric): Numeric | number => {
        const factory = NumericProvider.getGlobalFactory()
        const zero = factory.zero()
        
        if (significanceArg.isZero() || value.isZero()) {
          return zero
        }

        const significance = significanceArg.abs()
        // floor(value / significance) * significance
        return value.dividedBy(significance).floor().times(significance)
      })
  }
}
