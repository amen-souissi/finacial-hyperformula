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
import {PI} from './MathConstantsPlugin'
import {Numeric} from '../../Numeric'

/**
 * Interpreter plugin containing trigonometric functions
 */
export class TrigonometryPlugin extends FunctionPlugin implements FunctionPluginTypecheck<TrigonometryPlugin> {

  public static implementedFunctions: ImplementedFunctions = {
    'ACOS': {
      method: 'acos',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ASIN': {
      method: 'asin',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'COS': {
      method: 'cos',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'SIN': {
      method: 'sin',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'TAN': {
      method: 'tan',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ATAN': {
      method: 'atan',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ATAN2': {
      method: 'atan2',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
      ]
    },
    'COT': {
      method: 'cot',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'SEC': {
      method: 'sec',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'CSC': {
      method: 'csc',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'SINH': {
      method: 'sinh',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'COSH': {
      method: 'cosh',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'TANH': {
      method: 'tanh',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'COTH': {
      method: 'coth',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'SECH': {
      method: 'sech',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'CSCH': {
      method: 'csch',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ACOT': {
      method: 'acot',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ASINH': {
      method: 'asinh',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ACOSH': {
      method: 'acosh',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ATANH': {
      method: 'atanh',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'ACOTH': {
      method: 'acoth',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
  }

  /**
   * Corresponds to ACOS(value)
   *
   * Returns the arc cosine (or inverse cosine) of a number.
   *
   * @param ast
   * @param state
   */
  public acos(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ACOS'), 
      (arg: Numeric) => arg.acos()
    )
  }

  
  /**
   *
   */
  public asin(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ASIN'), 
      (arg: Numeric) => arg.asin()
    )
  }

  
  /**
   *
   */
  public cos(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COS'), 
      (arg: Numeric) => arg.cos()
    )
  }

  
  /**
   *
   */
  public sin(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SIN'), 
      (arg: Numeric) => arg.sin()
    )
  }

  
  /**
   *
   */
  public tan(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('TAN'), 
      (arg: Numeric) => arg.tan()
    )
  }

  
  /**
   *
   */
  public atan(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ATAN'), 
      (arg: Numeric) => arg.atan()
    )
  }

  
  /**
   *
   */
  public atan2(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ATAN2'),
      (x: Numeric, y: Numeric) => {
        if (x.isZero() && y.isZero()) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        return y.atan2(x)
      }
    )
  }

  
  /**
   *
   */
  public cot(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COT'),
      (arg: Numeric) => arg.isZero() ? new CellError(ErrorType.DIV_BY_ZERO) : arg.tan().pow(-1)
    )
  }

  
  /**
   *
   */
  public acot(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ACOT'),
      (arg: Numeric) => arg.isZero() ? PI / 2 : arg.pow(-1).atan()
    )
  }

  
  /**
   *
   */
  public sec(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SEC'),
      // Using native Math.cos for better precision near π/2 where cos approaches 0
      // The reciprocal calculation near zero requires maximum native precision
      (arg: Numeric) => 1 / Math.cos(arg.toNumber())
    )
  }

  
  /**
   *
   */
  public csc(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CSC'),
      (arg: Numeric) => arg.isZero() ? new CellError(ErrorType.DIV_BY_ZERO) : arg.sin().pow(-1)
    )
  }

  
  /**
   *
   */
  public sinh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SINH'), 
      (arg: Numeric) => arg.sinh()
    )
  }

  
  /**
   *
   */
  public asinh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ASINH'), 
      (arg: Numeric) => arg.asinh()
    )
  }

  
  /**
   *
   */
  public cosh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COSH'), 
      (arg: Numeric) => arg.cosh()
    )
  }

  
  /**
   *
   */
  public acosh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ACOSH'), 
      (arg: Numeric) => arg.acosh()
    )
  }

  
  /**
   *
   */
  public tanh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('TANH'), 
      (arg: Numeric) => arg.tanh()
    )
  }

  
  /**
   *
   */
  public atanh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ATANH'), 
      (arg: Numeric) => arg.atanh()
    )
  }

  
  /**
   *
   */
  public coth(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COTH'),
      (arg: Numeric) => arg.isZero() ? new CellError(ErrorType.DIV_BY_ZERO) : arg.tanh().pow(-1)
    )
  }

  
  /**
   *
   */
  public acoth(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ACOTH'),
      (arg: Numeric) => arg.isZero() ? new CellError(ErrorType.NUM, ErrorMessage.NonZero) : arg.pow(-1).atanh()
    )
  }

  
  /**
   *
   */
  public sech(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('SECH'),
      (arg: Numeric) => arg.cosh().pow(-1)
    )
  }

  
  /**
   *
   */
  public csch(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CSCH'),
      (arg: Numeric) => arg.isZero() ? new CellError(ErrorType.DIV_BY_ZERO) : arg.sinh().pow(-1)
    )
  }
}
