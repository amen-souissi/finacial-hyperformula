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
import {Numeric} from '../../Numeric'

/**
 *
 */
export class RandomPlugin extends FunctionPlugin implements FunctionPluginTypecheck<RandomPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'RAND': {
      method: 'rand',
      parameters: [],
      isVolatile: true,
    },
    'RANDBETWEEN': {
      method: 'randbetween',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
      isVolatile: true,
    },
  }

  /**
   * Corresponds to RAND()
   *
   * Returns a pseudo-random floating-point random number
   * in the range [0,1).
   *
   * @param ast
   * @param state
   */
  public rand(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('RAND'), Math.random)
  }

  
  /**
   *
   */
  public randbetween(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('RANDBETWEEN'),
      (lowerArg: Numeric, upperArg: Numeric) => {
        // Safe: integer bounds for RANDBETWEEN - values are rounded after validation
        let lower = lowerArg.toNumber()
        let upper = upperArg.toNumber()
        if (upper < lower) {
          return new CellError(ErrorType.NUM, ErrorMessage.WrongOrder)
        }
        lower = Math.ceil(lower)
        upper = Math.floor(upper) + 1
        if (lower === upper) {
          upper += 1
        }
        return lower + Math.floor(Math.random() * (upper - lower))
      }
    )
  }
}
