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
export class LogarithmPlugin extends FunctionPlugin implements FunctionPluginTypecheck<LogarithmPlugin> {

  public static implementedFunctions: ImplementedFunctions = {
    'LOG10': {
      method: 'log10',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'LOG': {
      method: 'log',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 10, greaterThan: 0},
      ]
    },
    'LN': {
      method: 'ln',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
  }

  
  /**
   *
   */
  public log10(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('LOG10'), 
      (arg: Numeric) => arg.log10()
    )
  }

  
  /**
   *
   */
  public log(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('LOG'),
      (arg: Numeric, base: Numeric) => arg.ln().dividedBy(base.ln())
    )
  }

  
  /**
   *
   */
  public ln(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('LN'), 
      (arg: Numeric) => arg.ln()
    )
  }
}
