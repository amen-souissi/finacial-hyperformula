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
export class IsOddPlugin extends FunctionPlugin implements FunctionPluginTypecheck<IsOddPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'ISODD': {
      method: 'isodd',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
  }

  
  /**
   *
   */
  public isodd(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ISODD'),
      (val: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const two = factory.fromNumber(2)
        const one = factory.one()
        // For odd numbers: |trunc(val)| % 2 === 1
        return val.trunc().abs().mod(two).equals(one)
      }
    )
  }
}
