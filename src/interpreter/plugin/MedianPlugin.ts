/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue, RawScalarValue} from '../InterpreterValue'
import {SimpleRangeValue} from '../../SimpleRangeValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {medianNumeric, largeNumeric, smallNumeric, Numeric} from '../../Numeric'

/**
 * Interpreter plugin containing MEDIAN function
 */
export class MedianPlugin extends FunctionPlugin implements FunctionPluginTypecheck<MedianPlugin> {

  public static implementedFunctions: ImplementedFunctions = {
    'MEDIAN': {
      method: 'median',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'LARGE': {
      method: 'large',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ],
    },
    'SMALL': {
      method: 'small',
      parameters: [
        {argumentType: FunctionArgumentType.RANGE},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ],
    },
  }

  /**
   * Corresponds to MEDIAN(Number1, Number2, ...).
   *
   * Returns a median of given numbers.
   *
   * @param ast
   * @param state
   */
  public median(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('MEDIAN'),
      (...args: RawScalarValue[]) => {
        const valuesPrecision = this.arithmeticHelper.coerceNumbersExactRanges(args)
        if (valuesPrecision instanceof CellError) {
          return valuesPrecision
        }
        if (valuesPrecision.length === 0) {
          return new CellError(ErrorType.NUM, ErrorMessage.OneValue)
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return medianNumeric(valuesPrecision)
      })
  }

  
  /**
   *
   */
  public large(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('LARGE'),
      (range: SimpleRangeValue, nArg: Numeric) => {
        const valsPrecision = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner())
        if (valsPrecision instanceof CellError) {
          return valsPrecision
        }
        // Safe: integer rank for LARGE/SMALL - no precision impact
        const n = nArg.trunc().toNumber()
        if (n > valsPrecision.length) {
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return largeNumeric(valsPrecision, n)
      }
    )
  }

  
  /**
   *
   */
  public small(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SMALL'),
      (range: SimpleRangeValue, nArg: Numeric) => {
        const valsPrecision = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner())
        if (valsPrecision instanceof CellError) {
          return valsPrecision
        }
        // Safe: integer rank for LARGE/SMALL - no precision impact
        const n = nArg.trunc().toNumber()
        if (n > valsPrecision.length) {
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        // Return Numeric directly - conversion to number happens at output (Exporter)
        return smallNumeric(valsPrecision, n)
      }
    )
  }
}
