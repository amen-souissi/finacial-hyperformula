/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {ProcedureAst} from '../../parser'
import {coerceComplexToString, complex} from '../ArithmeticHelper'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue, RawInterpreterValue} from '../InterpreterValue'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric, NumericProvider} from '../../Numeric'

/**
 * ComplexPlugin using complex (Numeric-based) for high-precision complex number calculations.
 */
export class ComplexPlugin extends FunctionPlugin implements FunctionPluginTypecheck<ComplexPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'COMPLEX': {
      method: 'complex',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},  // High precision real part
        {argumentType: FunctionArgumentType.NUMERIC},  // High precision imaginary part
        {argumentType: FunctionArgumentType.STRING, defaultValue: 'i'},
      ],
    },
    'IMABS': {
      method: 'imabs',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMAGINARY': {
      method: 'imaginary',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMREAL': {
      method: 'imreal',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMARGUMENT': {
      method: 'imargument',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMCONJUGATE': {
      method: 'imconjugate',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMCOS': {
      method: 'imcos',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMCOSH': {
      method: 'imcosh',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMCOT': {
      method: 'imcot',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMCSC': {
      method: 'imcsc',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMCSCH': {
      method: 'imcsch',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMSEC': {
      method: 'imsec',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMSECH': {
      method: 'imsech',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMSIN': {
      method: 'imsin',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMSINH': {
      method: 'imsinh',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMTAN': {
      method: 'imtan',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMDIV': {
      method: 'imdiv',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMPRODUCT': {
      method: 'improduct',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'IMSUM': {
      method: 'imsum',
      parameters: [
        {argumentType: FunctionArgumentType.ANY},
      ],
      repeatLastArgs: 1,
    },
    'IMSUB': {
      method: 'imsub',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMEXP': {
      method: 'imexp',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMLN': {
      method: 'imln',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMLOG10': {
      method: 'imlog10',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMLOG2': {
      method: 'imlog2',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
    'IMPOWER': {
      method: 'impower',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
        {argumentType: FunctionArgumentType.NUMERIC},
      ],
    },
    'IMSQRT': {
      method: 'imsqrt',
      parameters: [
        {argumentType: FunctionArgumentType.COMPLEX},
      ],
    },
  }

  
  /**
   * COMPLEX function - creates a complex number from real and imaginary parts.
   */
  public complex(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('COMPLEX'),
      (re: Numeric, im: Numeric, unit: string) => {
        if (unit !== 'i' && unit !== 'j') {
          return new CellError(ErrorType.VALUE, ErrorMessage.ShouldBeIorJ)
        }
        return coerceComplexToString([re, im], unit)
      }
    )
  }

  
  /**
   * IMABS function - returns absolute value (modulus) of complex number.
   */
  public imabs(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMABS'),
      (arg: complex) => absNumeric(arg)
    )
  }

  
  /**
   * IMAGINARY function - returns imaginary part of complex number.
   */
  public imaginary(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMAGINARY'),
      ([_re, im]: complex) => im
    )
  }

  
  /**
   * IMREAL function - returns real part of complex number.
   */
  public imreal(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMREAL'),
      ([re, _im]: complex) => re
    )
  }

  
  /**
   * IMARGUMENT function - returns argument (angle) of complex number.
   */
  public imargument(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMARGUMENT'),
      ([re, im]: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        if (re.equals(factory.zero()) && im.equals(factory.zero())) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        return im.atan2(re)
      }
    )
  }

  
  /**
   * IMCONJUGATE function - returns complex conjugate.
   */
  public imconjugate(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMCONJUGATE'),
      ([re, im]: complex) => coerceComplexToString([re, im.neg()])
    )
  }

  
  /**
   * IMCOS function - returns cosine of complex number.
   */
  public imcos(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMCOS'),
      (arg: complex) => coerceComplexToString(cosNumeric(arg))
    )
  }

  
  /**
   * IMCOSH function - returns hyperbolic cosine of complex number.
   */
  public imcosh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMCOSH'),
      (arg: complex) => coerceComplexToString(coshNumeric(arg))
    )
  }

  
  /**
   * IMCOT function - returns cotangent of complex number.
   */
  public imcot(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMCOT'),
      (arg: complex) => coerceComplexToString(divNumeric(cosNumeric(arg), sinNumeric(arg)))
    )
  }

  
  /**
   * IMCSC function - returns cosecant of complex number.
   */
  public imcsc(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMCSC'),
      (arg: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        return coerceComplexToString(divNumeric([factory.one(), factory.zero()], sinNumeric(arg)))
      }
    )
  }

  
  /**
   * IMCSCH function - returns hyperbolic cosecant of complex number.
   */
  public imcsch(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMCSCH'),
      (arg: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        return coerceComplexToString(divNumeric([factory.one(), factory.zero()], sinhNumeric(arg)))
      }
    )
  }

  
  /**
   * IMSEC function - returns secant of complex number.
   */
  public imsec(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMSEC'),
      (arg: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        return coerceComplexToString(divNumeric([factory.one(), factory.zero()], cosNumeric(arg)))
      }
    )
  }

  
  /**
   * IMSECH function - returns hyperbolic secant of complex number.
   */
  public imsech(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMSECH'),
      (arg: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        return coerceComplexToString(divNumeric([factory.one(), factory.zero()], coshNumeric(arg)))
      }
    )
  }

  
  /**
   * IMSIN function - returns sine of complex number.
   */
  public imsin(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMSIN'),
      (arg: complex) => coerceComplexToString(sinNumeric(arg))
    )
  }

  
  /**
   * IMSINH function - returns hyperbolic sine of complex number.
   */
  public imsinh(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMSINH'),
      (arg: complex) => coerceComplexToString(sinhNumeric(arg))
    )
  }

  
  /**
   * IMTAN function - returns tangent of complex number.
   */
  public imtan(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMTAN'),
      (arg: complex) => coerceComplexToString(divNumeric(sinNumeric(arg), cosNumeric(arg)))
    )
  }

  
  /**
   * IMDIV function - divides two complex numbers.
   */
  public imdiv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMDIV'),
      (arg1: complex, arg2: complex) => coerceComplexToString(divNumeric(arg1, arg2))
    )
  }

  
  /**
   * IMPRODUCT function - multiplies complex numbers.
   */
  public improduct(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMPRODUCT'),
      (...args: RawInterpreterValue[]) => {
        const coerced = this.arithmeticHelper.coerceComplexExactRanges(args)
        if (coerced instanceof CellError) {
          return coerced
        }
        const factory = NumericProvider.getGlobalFactory()
        let acc: complex = [factory.one(), factory.zero()]
        for (const val of coerced) {
          acc = mulNumeric(acc, val)
        }
        return coerceComplexToString(acc)
      }
    )
  }

  
  /**
   * IMSUM function - adds complex numbers.
   */
  public imsum(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMSUM'),
      (...args: RawInterpreterValue[]) => {
        const coerced = this.arithmeticHelper.coerceComplexExactRanges(args)
        if (coerced instanceof CellError) {
          return coerced
        }
        const factory = NumericProvider.getGlobalFactory()
        let acc: complex = [factory.zero(), factory.zero()]
        for (const val of coerced) {
          acc = addNumeric(acc, val)
        }
        return coerceComplexToString(acc)
      }
    )
  }

  
  /**
   * IMSUB function - subtracts two complex numbers.
   */
  public imsub(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMSUB'),
      (arg1: complex, arg2: complex) => coerceComplexToString(subNumeric(arg1, arg2))
    )
  }

  
  /**
   * IMEXP function - returns exponential of complex number.
   */
  public imexp(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMEXP'),
      (arg: complex) => coerceComplexToString(expNumeric(arg))
    )
  }

  
  /**
   * IMLN function - returns natural logarithm of complex number.
   */
  public imln(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMLN'),
      (arg: complex) => coerceComplexToString(lnNumeric(arg))
    )
  }

  
  /**
   * IMLOG10 function - returns base-10 logarithm of complex number.
   */
  public imlog10(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMLOG10'),
      (arg: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        const ln10 = factory.fromNumber(10).ln()
        const result = lnNumeric(arg)
        return coerceComplexToString([result[0].dividedBy(ln10), result[1].dividedBy(ln10)])
      }
    )
  }

  
  /**
   * IMLOG2 function - returns base-2 logarithm of complex number.
   */
  public imlog2(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMLOG2'),
      (arg: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        const ln2 = factory.fromNumber(2).ln()
        const result = lnNumeric(arg)
        return coerceComplexToString([result[0].dividedBy(ln2), result[1].dividedBy(ln2)])
      }
    )
  }

  
  /**
   * IMPOWER function - raises complex number to power.
   */
  public impower(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMPOWER'),
      (arg: complex, n: Numeric) => coerceComplexToString(powerNumeric(arg, n))
    )
  }

  
  /**
   * IMSQRT function - returns square root of complex number.
   */
  public imsqrt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('IMSQRT'),
      (arg: complex) => {
        const factory = NumericProvider.getGlobalFactory()
        return coerceComplexToString(powerNumeric(arg, factory.fromNumber(0.5)))
      }
    )
  }
}

// ============ HIGH-PRECISION COMPLEX NUMBER HELPER FUNCTIONS ============

/**
 * Add two complex numbers using Numeric.
 */
function addNumeric([re1, im1]: complex, [re2, im2]: complex): complex {
  return [re1.plus(re2), im1.plus(im2)]
}

/**
 * Subtract two complex numbers using Numeric.
 */
function subNumeric([re1, im1]: complex, [re2, im2]: complex): complex {
  return [re1.minus(re2), im1.minus(im2)]
}

/**
 * Multiply two complex numbers using Numeric.
 * (a + bi)(c + di) = (ac - bd) + (ad + bc)i
 */
function mulNumeric([re1, im1]: complex, [re2, im2]: complex): complex {
  return [
    re1.times(re2).minus(im1.times(im2)),
    re1.times(im2).plus(re2.times(im1))
  ]
}

/**
 * Divide two complex numbers using Numeric.
 * (a + bi)/(c + di) = ((a + bi)(c - di)) / (c² + d²)
 */
function divNumeric([re1, im1]: complex, [re2, im2]: complex): complex {
  const denom = re2.pow(2).plus(im2.pow(2))
  const [nomRe, nomIm] = mulNumeric([re1, im1], [re2, im2.neg()])
  return [nomRe.dividedBy(denom), nomIm.dividedBy(denom)]
}

/**
 * Complex cosine using Numeric.
 * cos(a + bi) = cos(a)cosh(b) - i*sin(a)sinh(b)
 */
function cosNumeric([re, im]: complex): complex {
  return [
    re.cos().times(im.cosh()),
    re.sin().neg().times(im.sinh())
  ]
}

/**
 * Complex hyperbolic cosine using Numeric.
 * cosh(a + bi) = cosh(a)cos(b) + i*sinh(a)sin(b)
 */
function coshNumeric([re, im]: complex): complex {
  return [
    re.cosh().times(im.cos()),
    re.sinh().times(im.sin())
  ]
}

/**
 * Complex sine using Numeric.
 * sin(a + bi) = sin(a)cosh(b) + i*cos(a)sinh(b)
 */
function sinNumeric([re, im]: complex): complex {
  return [
    re.sin().times(im.cosh()),
    re.cos().times(im.sinh())
  ]
}

/**
 * Complex hyperbolic sine using Numeric.
 * sinh(a + bi) = sinh(a)cos(b) + i*cosh(a)sin(b)
 */
function sinhNumeric([re, im]: complex): complex {
  return [
    re.sinh().times(im.cos()),
    re.cosh().times(im.sin())
  ]
}

/**
 * Complex exponential using Numeric.
 * exp(a + bi) = exp(a)(cos(b) + i*sin(b))
 */
function expNumeric([re, im]: complex): complex {
  const expRe = re.exp()
  return [
    expRe.times(im.cos()),
    expRe.times(im.sin())
  ]
}

/**
 * Complex absolute value (modulus) using Numeric.
 * |a + bi| = sqrt(a² + b²)
 */
function absNumeric([re, im]: complex): Numeric {
  return re.pow(2).plus(im.pow(2)).sqrt()
}

/**
 * Complex natural logarithm using Numeric.
 * ln(a + bi) = ln|z| + i*arg(z)
 */
function lnNumeric([re, im]: complex): complex {
  return [
    absNumeric([re, im]).ln(),
    im.atan2(re)
  ]
}

/**
 * Complex power using Numeric.
 * z^n = exp(n * ln(z))
 */
function powerNumeric(arg: complex, n: Numeric): complex {
  const [re, im] = lnNumeric(arg)
  return expNumeric([n.times(re), n.times(im)])
}
