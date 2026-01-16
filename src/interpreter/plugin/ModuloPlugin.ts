/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue} from '../InterpreterValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric} from '../../Numeric'

/**
 *
 */
export class ModuloPlugin extends FunctionPlugin implements FunctionPluginTypecheck<ModuloPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'MOD': {
      method: 'mod',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
  }

  
  /**
   *
   */
  public mod(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('MOD'), (dividend: Numeric, divisor: Numeric) => {
      if (divisor.isZero()) {
        return new CellError(ErrorType.DIV_BY_ZERO)
      } else {
        return dividend.mod(divisor)
      }
    })
  }
}
