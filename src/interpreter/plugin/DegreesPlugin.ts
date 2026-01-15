/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue} from '../InterpreterValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric, NumericProvider} from '../../Numeric'

/**
 *
 */
export class DegreesPlugin extends FunctionPlugin implements FunctionPluginTypecheck<DegreesPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'DEGREES': {
      method: 'degrees',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
  }

  
  /**
   *
   */
  public degrees(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('DEGREES'),
      (arg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const oneEighty = factory.fromNumber(180)
        const pi = factory.PI()
        // degrees = radians * (180 / π)
        return arg.times(oneEighty).dividedBy(pi)
      }
    )
  }
}
