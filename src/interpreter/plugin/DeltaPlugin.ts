/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue} from '../InterpreterValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric} from '../../Numeric'

/**
 *
 */
export class DeltaPlugin extends FunctionPlugin implements FunctionPluginTypecheck<DeltaPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'DELTA': {
      method: 'delta',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
      ]
    },
  }

  
  /**
   *
   */
  public delta(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('DELTA'),
      (left: Numeric, right: Numeric) => (left.equals(right) ? 1 : 0)
    )
  }
}
