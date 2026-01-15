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
export class PowerPlugin extends FunctionPlugin implements FunctionPluginTypecheck<PowerPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'POWER': {
      method: 'power',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
  }

  
  /**
   *
   */
  public power(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('POWER'), 
      (base: Numeric, exp: Numeric) => {
        // Use Numeric.pow() for high precision calculations
        const result = base.pow(exp)
        // Check if result is not finite in Decimal.js
        if (!result.isFinite()) {
          return Infinity  // Will be converted to #NUM! by interpreter
        }
        // Check if result exceeds IEEE 754 limits when converted to number
        // Decimal.js can represent very large numbers that overflow when converted
        const numResult = result.toNumber()
        if (!isFinite(numResult)) {
          return numResult  // Returns Infinity/-Infinity, converted to #NUM! by interpreter
        }
        return result
      }
    )
  }
}
