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
export class CharPlugin extends FunctionPlugin implements FunctionPluginTypecheck<CharPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'CHAR': {
      method: 'char',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ],
    },
    'UNICHAR': {
      method: 'unichar',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ],
    },
  }

  
  /**
   *
   */
  public char(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CHAR'), (value: Numeric) => {
      // Safe: integer character code - no precision impact
      const numValue = value.trunc().toNumber()
      if (numValue < 1 || numValue >= 256) {
        return new CellError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds)
      }

      return String.fromCharCode(numValue)
    })
  }

  
  /**
   *
   */
  public unichar(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CHAR'), (value: Numeric) => {
      // Safe: integer Unicode code point - no precision impact
      const numValue = value.trunc().toNumber()
      if (numValue < 1 || numValue >= 1114112) {
        return new CellError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds)
      }

      return String.fromCodePoint(numValue)
    })
  }
}
