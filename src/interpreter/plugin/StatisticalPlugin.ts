/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {ProcedureAst} from '../../parser'
import {InterpreterState} from '../InterpreterState'
import {InterpreterValue} from '../InterpreterValue'
import {besseli, besselj, besselk, bessely} from './3rdparty/bessel/bessel'
import {
  beta,
  binomial,
  centralF,
  chisquare,
  erf,
  erfc,
  exponential,
  gamma,
  gammafn,
  gammaln,
  hypgeom,
  lognormal,
  negbin,
  normal,
  normalci,
  poisson,
  studentt,
  tci,
  weibull
} from './3rdparty/jstat/jstat'
import {FunctionArgumentType, FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions} from './FunctionPlugin'
import {Numeric} from '../../Numeric'

/**
 * Statistical functions plugin.
 * 
 * PRECISION NOTE: All .toNumber() conversions in this plugin are required for 
 * compatibility with the jstat library (3rdparty/jstat/jstat), which only accepts
 * native JavaScript numbers. While this may cause precision loss for very large
 * or very precise numbers, it is the only way to leverage jstat's statistical
 * distribution functions (normal, gamma, beta, binomial, etc.).
 * 
 * Future improvement: Implement native Numeric versions of these statistical
 * distribution functions to eliminate the need for .toNumber() conversions.
 */
export class StatisticalPlugin extends FunctionPlugin implements FunctionPluginTypecheck<StatisticalPlugin> {
  public static implementedFunctions: ImplementedFunctions = {
    'ERF': {
      method: 'erf',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, optionalArg: true},
      ]
    },
    'ERFC': {
      method: 'erfc',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'EXPON.DIST': {
      method: 'expondist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'FISHER': {
      method: 'fisher',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: -1, lessThan: 1}
      ]
    },
    'FISHERINV': {
      method: 'fisherinv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'GAMMA': {
      method: 'gamma',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'GAMMA.DIST': {
      method: 'gammadist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'GAMMALN': {
      method: 'gammaln',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0}
      ]
    },
    'GAMMA.INV': {
      method: 'gammainv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, lessThan: 1},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ]
    },
    'GAUSS': {
      method: 'gauss',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'BETA.DIST': {
      method: 'betadist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 1},
      ]
    },
    'BETA.INV': {
      method: 'betainv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, defaultValue: 1},
      ]
    },
    'BINOM.DIST': {
      method: 'binomialdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'BINOM.INV': {
      method: 'binomialinv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, lessThan: 1},
      ]
    },
    'BESSELI': {
      method: 'besselifn',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
      ]
    },
    'BESSELJ': {
      method: 'besseljfn',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
      ]
    },
    'BESSELK': {
      method: 'besselkfn',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
      ]
    },
    'BESSELY': {
      method: 'besselyfn',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
      ]
    },
    'CHISQ.DIST': {
      method: 'chisqdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1, maxValue: 1e10},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'CHISQ.DIST.RT': {
      method: 'chisqdistrt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1, maxValue: 1e10},
      ]
    },
    'CHISQ.INV': {
      method: 'chisqinv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1, maxValue: 1e10},
      ]
    },
    'CHISQ.INV.RT': {
      method: 'chisqinvrt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'F.DIST': {
      method: 'fdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'F.DIST.RT': {
      method: 'fdistrt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'F.INV': {
      method: 'finv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'F.INV.RT': {
      method: 'finvrt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'WEIBULL.DIST': {
      method: 'weibulldist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'POISSON.DIST': {
      method: 'poissondist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'HYPGEOM.DIST': {
      method: 'hypgeomdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'T.DIST': {
      method: 'tdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'T.DIST.2T': {
      method: 'tdist2t',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'T.DIST.RT': {
      method: 'tdistrt',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'TDIST': {
      method: 'tdistold',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.INTEGER, minValue: 1, maxValue: 2},
      ]
    },
    'T.INV': {
      method: 'tinv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, lessThan: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'T.INV.2T': {
      method: 'tinv2t',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ]
    },
    'LOGNORM.DIST': {
      method: 'lognormdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'LOGNORM.INV': {
      method: 'lognorminv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, lessThan: 1},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ]
    },
    'NORM.DIST': {
      method: 'normdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'NORM.INV': {
      method: 'norminv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, lessThan: 1},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ]
    },
    'NORM.S.DIST': {
      method: 'normsdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'NORM.S.INV': {
      method: 'normsinv',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, lessThan: 1},
      ]
    },
    'PHI': {
      method: 'phi',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC}
      ]
    },
    'NEGBINOM.DIST': {
      method: 'negbinomdist',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 0, maxValue: 1},
        {argumentType: FunctionArgumentType.BOOLEAN},
      ]
    },
    'CONFIDENCE.NORM': {
      method: 'confidencenorm',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, lessThan: 1},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ],
    },
    'CONFIDENCE.T': {
      method: 'confidencet',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0, lessThan: 1},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
        {argumentType: FunctionArgumentType.NUMERIC, minValue: 1},
      ],
    },
    'STANDARDIZE': {
      method: 'standardize',
      parameters: [
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC},
        {argumentType: FunctionArgumentType.NUMERIC, greaterThan: 0},
      ],
    },
  }

  public static aliases = {
    NEGBINOMDIST: 'NEGBINOM.DIST',
    EXPONDIST: 'EXPON.DIST',
    BETADIST: 'BETA.DIST',
    NORMDIST: 'NORM.DIST',
    NORMINV: 'NORM.INV',
    NORMSDIST: 'NORM.S.DIST',
    NORMSINV: 'NORM.S.INV',
    LOGNORMDIST: 'LOGNORM.DIST',
    LOGINV: 'LOGNORM.INV',
    TINV: 'T.INV.2T',
    HYPGEOMDIST: 'HYPGEOM.DIST',
    POISSON: 'POISSON.DIST',
    WEIBULL: 'WEIBULL.DIST',
    FINV: 'F.INV.RT',
    FDIST: 'F.DIST.RT',
    CHIDIST: 'CHISQ.DIST.RT',
    CHIINV: 'CHISQ.INV.RT',
    GAMMADIST: 'GAMMA.DIST',
    'GAMMALN.PRECISE': 'GAMMALN',
    GAMMAINV: 'GAMMA.INV',
    BETAINV: 'BETA.INV',
    BINOMDIST: 'BINOM.DIST',
    CONFIDENCE: 'CONFIDENCE.NORM',
    CRITBINOM: 'BINOM.INV',
    WEIBULLDIST: 'WEIBULL.DIST',
    TINV2T: 'T.INV.2T',
    TDISTRT: 'T.DIST.RT',
    TDIST2T: 'T.DIST.2T',
    FINVRT: 'F.INV.RT',
    FDISTRT: 'F.DIST.RT',
    CHIDISTRT: 'CHISQ.DIST.RT',
    CHIINVRT: 'CHISQ.INV.RT',
    LOGNORMINV: 'LOGNORM.INV',
    POISSONDIST: 'POISSON.DIST',
  }

  
  /**
   *
   */
  public erf(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ERF'), (lowerBound: Numeric, upperBound?: Numeric) => {
      if (upperBound === undefined) {
        return erf(lowerBound.toNumber())
      } else {
        return erf(upperBound.toNumber()) - erf(lowerBound.toNumber())
      }
    })
  }

  
  /**
   *
   */
  public erfc(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('ERFC'), (x: Numeric) => erfc(x.toNumber()))
  }

  
  /**
   *
   */
  public expondist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('EXPON.DIST'),
      (x: Numeric, lambda: Numeric, cumulative: boolean) => {
        if (cumulative) {
          return exponential.cdf(x.toNumber(), lambda.toNumber())
        } else {
          return exponential.pdf(x.toNumber(), lambda.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public fisher(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FISHER'),
      (x: Numeric) => {
        const xNum = x.toNumber()
        return Math.log((1 + xNum) / (1 - xNum)) / 2
      }
    )
  }

  
  /**
   *
   */
  public fisherinv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('FISHERINV'),
      (y: Numeric) => 1 - 2 / (Math.exp(2 * y.toNumber()) + 1)
    )
  }

  
  /**
   *
   */
  public gamma(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('GAMMA'), (x: Numeric) => gammafn(x.toNumber()))
  }

  
  /**
   *
   */
  public gammadist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('GAMMA.DIST'),
      (value: Numeric, alphaVal: Numeric, betaVal: Numeric, cumulative: boolean) => {
        if (cumulative) {
          return gamma.cdf(value.toNumber(), alphaVal.toNumber(), betaVal.toNumber())
        } else {
          return gamma.pdf(value.toNumber(), alphaVal.toNumber(), betaVal.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public gammaln(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('GAMMALN'), (x: Numeric) => gammaln(x.toNumber()))
  }

  
  /**
   *
   */
  public gammainv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('GAMMA.INV'), (p: Numeric, a: Numeric, b: Numeric) => gamma.inv(p.toNumber(), a.toNumber(), b.toNumber()))
  }

  
  /**
   *
   */
  public gauss(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('GAUSS'),
      (z: Numeric) => normal.cdf(z.toNumber(), 0, 1) - 0.5
    )
  }

  
  /**
   *
   */
  public betadist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BETA.DIST'),
      (xArg: Numeric, alphaVal: Numeric, betaVal: Numeric, cumulative: boolean, A: Numeric, B: Numeric) => {
        let x = xArg.toNumber()
        const ANum = A.toNumber()
        const BNum = B.toNumber()
        if (x <= ANum) {
          return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall)
        } else if (x >= BNum) {
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        x = (x - ANum) / (BNum - ANum)
        if (cumulative) {
          return beta.cdf(x, alphaVal.toNumber(), betaVal.toNumber())
        } else {
          return beta.pdf(x, alphaVal.toNumber(), betaVal.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public betainv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BETA.INV'),
      (x: Numeric, alphaVal: Numeric, betaVal: Numeric, A: Numeric, B: Numeric) => {
        const ANum = A.toNumber()
        const BNum = B.toNumber()
        if (ANum >= BNum) {
          return new CellError(ErrorType.NUM, ErrorMessage.WrongOrder)
        } else {
          return beta.inv(x.toNumber(), alphaVal.toNumber(), betaVal.toNumber()) * (BNum - ANum) + ANum
        }
      }
    )
  }

  
  /**
   *
   */
  public binomialdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BINOM.DIST'),
      (succArg: Numeric, trialsArg: Numeric, prob: Numeric, cumulative: boolean) => {
        let succ = succArg.toNumber()
        let trials = trialsArg.toNumber()
        if (succ > trials) {
          return new CellError(ErrorType.NUM, ErrorMessage.WrongOrder)
        }
        succ = Math.trunc(succ)
        trials = Math.trunc(trials)
        if (cumulative) {
          return binomial.cdf(succ, trials, prob.toNumber())
        } else {
          return binomial.pdf(succ, trials, prob.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public binomialinv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BINOM.INV'),
      (trialsArg: Numeric, prob: Numeric, alpha: Numeric) => {
        const trials = Math.trunc(trialsArg.toNumber())
        const probNum = prob.toNumber()
        const alphaNum = alpha.toNumber()
        let lower = -1
        let upper = trials
        while (upper > lower + 1) {
          const mid = Math.trunc((lower + upper) / 2)
          if (binomial.cdf(mid, trials, probNum) >= alphaNum) {
            upper = mid
          } else {
            lower = mid
          }
        }
        return upper
      }
    )
  }

  
  /**
   *
   */
  public besselifn(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BESSELI'),
      (x: Numeric, n: Numeric) => besseli(x.toNumber(), Math.trunc(n.toNumber()))
    )
  }

  
  /**
   *
   */
  public besseljfn(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BESSELJ'),
      (x: Numeric, n: Numeric) => besselj(x.toNumber(), Math.trunc(n.toNumber()))
    )
  }

  
  /**
   *
   */
  public besselkfn(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BESSELK'),
      (x: Numeric, n: Numeric) => besselk(x.toNumber(), Math.trunc(n.toNumber()))
    )
  }

  
  /**
   *
   */
  public besselyfn(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('BESSELY'),
      (x: Numeric, n: Numeric) => bessely(x.toNumber(), Math.trunc(n.toNumber()))
    )
  }

  
  /**
   *
   */
  public chisqdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.DIST'),
      (x: Numeric, deg: Numeric, cumulative: boolean) => {
        const degNum = Math.trunc(deg.toNumber())
        if (cumulative) {
          return chisquare.cdf(x.toNumber(), degNum)
        } else {
          return chisquare.pdf(x.toNumber(), degNum)
        }
      }
    )
  }

  
  /**
   *
   */
  public chisqdistrt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.DIST.RT'),
      (x: Numeric, deg: Numeric) => 1 - chisquare.cdf(x.toNumber(), Math.trunc(deg.toNumber()))
    )
  }

  
  /**
   *
   */
  public chisqinv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.INV'),
      (p: Numeric, deg: Numeric) => chisquare.inv(p.toNumber(), Math.trunc(deg.toNumber()))
    )
  }

  
  /**
   *
   */
  public chisqinvrt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.INV.RT'),
      (p: Numeric, deg: Numeric) => chisquare.inv(1.0 - p.toNumber(), Math.trunc(deg.toNumber()))
    )
  }

  
  /**
   *
   */
  public fdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('F.DIST'),
      (x: Numeric, deg1: Numeric, deg2: Numeric, cumulative: boolean) => {
        const deg1Num = Math.trunc(deg1.toNumber())
        const deg2Num = Math.trunc(deg2.toNumber())
        if (cumulative) {
          return centralF.cdf(x.toNumber(), deg1Num, deg2Num)
        } else {
          return centralF.pdf(x.toNumber(), deg1Num, deg2Num)
        }
      }
    )
  }

  
  /**
   *
   */
  public fdistrt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('F.DIST.RT'),
      (x: Numeric, deg1: Numeric, deg2: Numeric) => 1 - centralF.cdf(x.toNumber(), Math.trunc(deg1.toNumber()), Math.trunc(deg2.toNumber()))
    )
  }

  
  /**
   *
   */
  public finv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('F.INV'),
      (p: Numeric, deg1: Numeric, deg2: Numeric) => centralF.inv(p.toNumber(), Math.trunc(deg1.toNumber()), Math.trunc(deg2.toNumber()))
    )
  }

  
  /**
   *
   */
  public finvrt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('F.INV.RT'),
      (p: Numeric, deg1: Numeric, deg2: Numeric) => centralF.inv(1.0 - p.toNumber(), Math.trunc(deg1.toNumber()), Math.trunc(deg2.toNumber()))
    )
  }

  
  /**
   *
   */
  public weibulldist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('WEIBULL.DIST'),
      (x: Numeric, shape: Numeric, scale: Numeric, cumulative: boolean) => {
        if (cumulative) {
          return weibull.cdf(x.toNumber(), scale.toNumber(), shape.toNumber())
        } else {
          return weibull.pdf(x.toNumber(), scale.toNumber(), shape.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public poissondist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('POISSON.DIST'),
      (xArg: Numeric, mean: Numeric, cumulative: boolean) => {
        const x = Math.trunc(xArg.toNumber())
        if (cumulative) {
          return poisson.cdf(x, mean.toNumber())
        } else {
          return poisson.pdf(x, mean.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public hypgeomdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('HYPGEOM.DIST'),
      (sArg: Numeric, numberSArg: Numeric, populationSArg: Numeric, numberPopArg: Numeric, cumulative: boolean) => {
        let s = sArg.toNumber()
        let numberS = numberSArg.toNumber()
        let populationS = populationSArg.toNumber()
        let numberPop = numberPopArg.toNumber()
        if (s > numberS || s > populationS || numberS > numberPop || populationS > numberPop) {
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        if (s + numberPop < populationS + numberS) {
          return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
        }
        s = Math.trunc(s)
        numberS = Math.trunc(numberS)
        populationS = Math.trunc(populationS)
        numberPop = Math.trunc(numberPop)

        if (cumulative) {
          return hypgeom.cdf(s, numberPop, populationS, numberS)
        } else {
          return hypgeom.pdf(s, numberPop, populationS, numberS)
        }
      }
    )
  }

  
  /**
   *
   */
  public tdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('T.DIST'),
      (x: Numeric, deg: Numeric, cumulative: boolean) => {
        const degNum = Math.trunc(deg.toNumber())
        if (cumulative) {
          return studentt.cdf(x.toNumber(), degNum)
        } else {
          return studentt.pdf(x.toNumber(), degNum)
        }
      }
    )
  }

  
  /**
   *
   */
  public tdist2t(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('T.DIST.2T'),
      (x: Numeric, deg: Numeric) => (1 - studentt.cdf(x.toNumber(), Math.trunc(deg.toNumber()))) * 2
    )
  }

  
  /**
   *
   */
  public tdistrt(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('T.DIST.RT'),
      (x: Numeric, deg: Numeric) => 1 - studentt.cdf(x.toNumber(), Math.trunc(deg.toNumber()))
    )
  }

  
  /**
   *
   */
  public tdistold(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('TDIST'),
      (x: Numeric, deg: Numeric, mode: number) => mode * (1 - studentt.cdf(x.toNumber(), Math.trunc(deg.toNumber())))
    )
  }

  
  /**
   *
   */
  public tinv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('T.INV'),
      (p: Numeric, deg: Numeric) => studentt.inv(p.toNumber(), Math.trunc(deg.toNumber()))
    )
  }

  
  /**
   *
   */
  public tinv2t(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('T.INV.2T'),
      (p: Numeric, deg: Numeric) => studentt.inv(1 - p.toNumber() / 2, Math.trunc(deg.toNumber()))
    )
  }

  
  /**
   *
   */
  public lognormdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('LOGNORM.DIST'),
      (x: Numeric, mean: Numeric, stddev: Numeric, cumulative: boolean) => {
        if (cumulative) {
          return lognormal.cdf(x.toNumber(), mean.toNumber(), stddev.toNumber())
        } else {
          return lognormal.pdf(x.toNumber(), mean.toNumber(), stddev.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public lognorminv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('LOGNORM.INV'),
      (p: Numeric, mean: Numeric, stddev: Numeric) => lognormal.inv(p.toNumber(), mean.toNumber(), stddev.toNumber())
    )
  }

  
  /**
   *
   */
  public normdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NORM.DIST'),
      (x: Numeric, mean: Numeric, stddev: Numeric, cumulative: boolean) => {
        if (cumulative) {
          return normal.cdf(x.toNumber(), mean.toNumber(), stddev.toNumber())
        } else {
          return normal.pdf(x.toNumber(), mean.toNumber(), stddev.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public norminv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NORM.INV'),
      (p: Numeric, mean: Numeric, stddev: Numeric) => normal.inv(p.toNumber(), mean.toNumber(), stddev.toNumber())
    )
  }

  
  /**
   *
   */
  public normsdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NORM.S.DIST'),
      (x: Numeric, cumulative: boolean) => {
        if (cumulative) {
          return normal.cdf(x.toNumber(), 0, 1)
        } else {
          return normal.pdf(x.toNumber(), 0, 1)
        }
      }
    )
  }

  
  /**
   *
   */
  public normsinv(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NORM.S.INV'),
      (p: Numeric) => normal.inv(p.toNumber(), 0, 1)
    )
  }

  
  /**
   *
   */
  public phi(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('PHI'),
      (x: Numeric) => normal.pdf(x.toNumber(), 0, 1)
    )
  }

  
  /**
   *
   */
  public negbinomdist(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('NEGBINOM.DIST'),
      (nfArg: Numeric, nsArg: Numeric, p: Numeric, cumulative: boolean) => {
        const nf = Math.trunc(nfArg.toNumber())
        const ns = Math.trunc(nsArg.toNumber())
        if (cumulative) {
          return negbin.cdf(nf, ns, p.toNumber())
        } else {
          return negbin.pdf(nf, ns, p.toNumber())
        }
      }
    )
  }

  
  /**
   *
   */
  public confidencenorm(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CONFIDENCE.NORM'),
      // eslint-disable-next-line
      // @ts-ignore
      (alpha: Numeric, stddev: Numeric, size: Numeric) => normalci(1, alpha.toNumber(), stddev.toNumber(), Math.trunc(size.toNumber()))[1] - 1
    )
  }

  
  /**
   *
   */
  public confidencet(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('CONFIDENCE.T'),
      (alpha: Numeric, stddev: Numeric, sizeArg: Numeric) => {
        const size = Math.trunc(sizeArg.toNumber())
        if (size === 1) {
          return new CellError(ErrorType.DIV_BY_ZERO)
        }
        // eslint-disable-next-line
        // @ts-ignore
        return tci(1, alpha.toNumber(), stddev.toNumber(), size)[1] - 1
      }
    )
  }

  
  /**
   *
   */
  public standardize(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('STANDARDIZE'),
      (x: Numeric, mean: Numeric, stddev: Numeric) => (x.toNumber() - mean.toNumber()) / stddev.toNumber()
    )
  }
}

