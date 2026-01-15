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
export class RadiansPlugin extends FunctionPlugin implements FunctionPluginTypecheck<RadiansPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'RADIANS': {
      method: 'radians',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ],
    },
  }

  
  /**
   *
   */
  public radians(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('RADIANS'),
      (arg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const oneEighty = factory.fromNumber(180)
        const pi = factory.PI()
        // radians = degrees * (π / 180)
        return arg.times(pi).dividedBy(oneEighty)
      }
    )
  }
}
