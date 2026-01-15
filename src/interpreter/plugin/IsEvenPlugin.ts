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
export class IsEvenPlugin extends FunctionPlugin implements FunctionPluginTypecheck<IsEvenPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'ISEVEN': {
      method: 'iseven',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
  }

  
  /**
   *
   */
  public iseven(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ISEVEN'),
      (val: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const two = factory.fromNumber(2)
        return val.trunc().mod(two).isZero()
      }
    )
  }
}
