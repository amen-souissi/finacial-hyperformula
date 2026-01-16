/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue} from '../InterpreterValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric, NumericProvider} from '../../Numeric'

// Legacy constant kept for backward compatibility
export const PI = parseFloat(Math.PI.toFixed(14))

/**
 *
 */
export class MathConstantsPlugin extends FunctionPlugin implements FunctionPluginTypecheck<MathConstantsPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'PI': {
      method: 'pi',
      parameters: [],
    },
    'SQRTPI': {
      method: 'sqrtpi',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0}
      ],
    },
  }

  
  /**
   *
   */
  public pi(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('PI'),
      () => {
        // Return the legacy PI value for backward compatibility
        // This matches Excel's PI() which returns 3.14159265358979
        return PI
      }
    )
  }

  
  /**
   *
   */
  public sqrtpi(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SQRTPI'),
      (arg: Numeric) => {
        const factory = NumericProvider.getGlobalFactory()
        const pi = factory.PI()
        // sqrt(π * arg)
        return pi.times(arg).sqrt()
      }
    )
  }
}
