/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import { Numeric } from './Numeric'
import { NumericProvider } from './NumericProvider'

/**
 * Utility functions for operations on Numeric arrays.
 * These functions preserve precision by working entirely with Numeric types.
 * 
 * Use these instead of converting to native numbers with toNativeNumerics().
 */

/**
 * Comparator function for sorting Numeric arrays.
 * Use with Array.sort(): arr.sort(numericComparator)
 * 
 * @param a First Numeric value
 * @param b Second Numeric value
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function numericComparator(a: Numeric, b: Numeric): number {
  return a.comparedTo(b)
}

/**
 * Sorts a Numeric array in ascending order (in place).
 * Returns the sorted array for chaining.
 * 
 * @param arr Array of Numeric values to sort
 * @returns The sorted array (same reference)
 */
export function sortNumericArray(arr: Numeric[]): Numeric[] {
  return arr.sort(numericComparator)
}

/**
 * Computes the sum of a Numeric array.
 * 
 * @param arr Array of Numeric values
 * @returns Sum as Numeric (zero if array is empty)
 */
export function sumNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    return NumericProvider.getGlobalFactory().zero()
  }
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    result = result.plus(arr[i])
  }
  return result
}

/**
 * Computes the arithmetic mean of a Numeric array.
 * 
 * @param arr Array of Numeric values (must not be empty)
 * @returns Mean as Numeric
 * @throws Error if array is empty
 */
export function meanNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    throw new Error('Cannot compute mean of empty array')
  }
  const sum = sumNumeric(arr)
  const count = NumericProvider.getGlobalFactory().fromNumber(arr.length)
  return sum.dividedBy(count)
}

/**
 * Computes the product of a Numeric array.
 * 
 * @param arr Array of Numeric values
 * @returns Product as Numeric (one if array is empty)
 */
export function productNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    return NumericProvider.getGlobalFactory().one()
  }
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    result = result.times(arr[i])
  }
  return result
}

/**
 * Finds the minimum value in a Numeric array.
 * 
 * @param arr Array of Numeric values (must not be empty)
 * @returns Minimum value as Numeric
 * @throws Error if array is empty
 */
export function minNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    throw new Error('Cannot find minimum of empty array')
  }
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].lessThan(result)) {
      result = arr[i]
    }
  }
  return result
}

/**
 * Finds the maximum value in a Numeric array.
 * 
 * @param arr Array of Numeric values (must not be empty)
 * @returns Maximum value as Numeric
 * @throws Error if array is empty
 */
export function maxNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    throw new Error('Cannot find maximum of empty array')
  }
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].greaterThan(result)) {
      result = arr[i]
    }
  }
  return result
}

/**
 * Computes the sum of squared deviations from the mean.
 * sumsqerr = Σ(x - mean)²
 * 
 * @param arr Array of Numeric values
 * @returns Sum of squared errors as Numeric
 */
export function sumSquaredErrorsNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    return NumericProvider.getGlobalFactory().zero()
  }
  const avg = meanNumeric(arr)
  let result = NumericProvider.getGlobalFactory().zero()
  for (const val of arr) {
    const diff = val.minus(avg)
    result = result.plus(diff.times(diff))
  }
  return result
}

/**
 * Computes the variance of a Numeric array (population variance).
 * 
 * @param arr Array of Numeric values
 * @param sample If true, computes sample variance (n-1), otherwise population variance (n)
 * @returns Variance as Numeric
 */
export function varianceNumeric(arr: Numeric[], sample: boolean = false): Numeric {
  if (arr.length === 0) {
    return NumericProvider.getGlobalFactory().zero()
  }
  const divisor = sample ? arr.length - 1 : arr.length
  if (divisor <= 0) {
    return NumericProvider.getGlobalFactory().zero()
  }
  const sse = sumSquaredErrorsNumeric(arr)
  return sse.dividedBy(NumericProvider.getGlobalFactory().fromNumber(divisor))
}

/**
 * Computes the standard deviation of a Numeric array.
 * 
 * @param arr Array of Numeric values
 * @param sample If true, computes sample std dev (n-1), otherwise population std dev (n)
 * @returns Standard deviation as Numeric
 */
export function stdDevNumeric(arr: Numeric[], sample: boolean = false): Numeric {
  return varianceNumeric(arr, sample).sqrt()
}

/**
 * Computes the skewness of a Numeric array.
 * 
 * Sample skewness (sample=true): n / ((n-1)(n-2)) * Σ((x_i - mean) / s)^3
 * Population skewness (sample=false): (1/n) * Σ((x_i - mean) / σ)^3
 * 
 * @param arr Array of Numeric values
 * @param sample If true, computes sample skewness, otherwise population skewness
 * @returns Skewness as Numeric
 */
export function skewnessNumeric(arr: Numeric[], sample: boolean = true): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  const n = arr.length
  
  if (n < (sample ? 3 : 1)) {
    throw new Error(sample ? 'Cannot compute sample skewness with fewer than 3 values' : 'Cannot compute skewness of empty array')
  }
  
  const avg = meanNumeric(arr)
  const s = stdDevNumeric(arr, sample)
  const zero = factory.zero()
  
  if (s.equals(zero)) {
    return zero
  }
  
  // Sum of ((x_i - mean) / s)^3
  let sum = zero
  for (const val of arr) {
    const z = val.minus(avg).dividedBy(s)
    sum = sum.plus(z.pow(3))
  }
  
  if (sample) {
    // Sample skewness adjustment: n / ((n-1)(n-2))
    const nNum = factory.fromNumber(n)
    const adjustment = nNum.dividedBy(
      factory.fromNumber(n - 1).times(factory.fromNumber(n - 2))
    )
    return adjustment.times(sum)
  } else {
    // Population skewness: (1/n) * sum
    return sum.dividedBy(factory.fromNumber(n))
  }
}

/**
 * Computes the excess kurtosis of a Numeric array.
 * 
 * @param arr Array of Numeric values
 * @param sample If true, computes sample kurtosis, otherwise population kurtosis
 * @returns Excess kurtosis as Numeric (normal distribution = 0)
 */
export function kurtosisNumeric(arr: Numeric[], sample: boolean = true): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  const n = arr.length
  
  if (n < (sample ? 4 : 1)) {
    throw new Error(sample ? 'Cannot compute sample kurtosis with fewer than 4 values' : 'Cannot compute kurtosis of empty array')
  }
  
  const avg = meanNumeric(arr)
  const s = stdDevNumeric(arr, sample)
  const zero = factory.zero()
  const three = factory.fromNumber(3)
  
  if (s.equals(zero)) {
    return zero
  }
  
  // Sum of ((x_i - mean) / s)^4
  let sum = zero
  for (const val of arr) {
    const z = val.minus(avg).dividedBy(s)
    sum = sum.plus(z.pow(4))
  }
  
  if (sample) {
    // Sample kurtosis with bias correction
    const nNum = factory.fromNumber(n)
    const n1 = factory.fromNumber(n - 1)
    const n2 = factory.fromNumber(n - 2)
    const n3 = factory.fromNumber(n - 3)
    
    // (n(n+1)/((n-1)(n-2)(n-3))) * sum - 3(n-1)^2/((n-2)(n-3))
    const firstTerm = nNum.times(nNum.plus(factory.one()))
      .dividedBy(n1.times(n2).times(n3))
      .times(sum)
    const secondTerm = three.times(n1.pow(2))
      .dividedBy(n2.times(n3))
    
    return firstTerm.minus(secondTerm)
  } else {
    // Population kurtosis: (1/n) * sum - 3
    return sum.dividedBy(factory.fromNumber(n)).minus(three)
  }
}

/**
 * Computes the geometric mean of a Numeric array.
 * geomean = (Π x_i)^(1/n)
 * 
 * @param arr Array of Numeric values (all must be positive)
 * @returns Geometric mean as Numeric
 */
export function geomeanNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    throw new Error('Cannot compute geometric mean of empty array')
  }
  // Use logarithms for numerical stability: exp(mean(ln(x_i)))
  let sumLn = NumericProvider.getGlobalFactory().zero()
  for (const val of arr) {
    sumLn = sumLn.plus(val.ln())
  }
  const meanLn = sumLn.dividedBy(NumericProvider.getGlobalFactory().fromNumber(arr.length))
  return meanLn.exp()
}

/**
 * Computes the harmonic mean of a Numeric array.
 * harmean = n / Σ(1/x_i)
 * 
 * @param arr Array of Numeric values (all must be non-zero)
 * @returns Harmonic mean as Numeric
 */
export function harmeanNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    throw new Error('Cannot compute harmonic mean of empty array')
  }
  const factory = NumericProvider.getGlobalFactory()
  let sumReciprocals = factory.zero()
  for (const val of arr) {
    sumReciprocals = sumReciprocals.plus(factory.one().dividedBy(val))
  }
  return factory.fromNumber(arr.length).dividedBy(sumReciprocals)
}

/**
 * Computes the average deviation from mean.
 * avedev = (1/n) * Σ|x - mean|
 * 
 * @param arr Array of Numeric values
 * @returns Average deviation as Numeric
 */
export function avedevNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    return NumericProvider.getGlobalFactory().zero()
  }
  const avg = meanNumeric(arr)
  let sumAbsDev = NumericProvider.getGlobalFactory().zero()
  for (const val of arr) {
    sumAbsDev = sumAbsDev.plus(val.minus(avg).abs())
  }
  return sumAbsDev.dividedBy(NumericProvider.getGlobalFactory().fromNumber(arr.length))
}

/**
 * Computes the median of a Numeric array.
 * 
 * @param arr Array of Numeric values (will be sorted, original not modified)
 * @returns Median as Numeric
 */
export function medianNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    throw new Error('Cannot compute median of empty array')
  }
  const sorted = [...arr].sort(numericComparator)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return sorted[mid - 1].plus(sorted[mid]).dividedBy(NumericProvider.getGlobalFactory().fromNumber(2))
  } else {
    return sorted[mid]
  }
}

/**
 * Returns the k-th largest value in the array (1-indexed).
 * 
 * @param arr Array of Numeric values
 * @param k Position (1 = largest, 2 = second largest, etc.)
 * @returns k-th largest value as Numeric
 */
export function largeNumeric(arr: Numeric[], k: number): Numeric {
  if (arr.length === 0 || k < 1 || k > arr.length) {
    throw new Error(`Invalid k=${k} for array of length ${arr.length}`)
  }
  const sorted = [...arr].sort(numericComparator)
  return sorted[sorted.length - k]
}

/**
 * Returns the k-th smallest value in the array (1-indexed).
 * 
 * @param arr Array of Numeric values
 * @param k Position (1 = smallest, 2 = second smallest, etc.)
 * @returns k-th smallest value as Numeric
 */
export function smallNumeric(arr: Numeric[], k: number): Numeric {
  if (arr.length === 0 || k < 1 || k > arr.length) {
    throw new Error(`Invalid k=${k} for array of length ${arr.length}`)
  }
  const sorted = [...arr].sort(numericComparator)
  return sorted[k - 1]
}

/**
 * Computes the GCD (Greatest Common Divisor) of two Numeric values.
 * Uses Euclidean algorithm.
 * 
 * @param a First value (will be truncated to integer)
 * @param b Second value (will be truncated to integer)
 * @returns GCD as Numeric
 */
export function gcdNumeric(a: Numeric, b: Numeric): Numeric {
  let x = a.abs().trunc()
  let y = b.abs().trunc()
  const factory = NumericProvider.getGlobalFactory()
  const zero = factory.zero()
  
  while (!y.equals(zero)) {
    const temp = y
    y = x.mod(y)
    x = temp
  }
  return x
}

/**
 * Computes the LCM (Least Common Multiple) of two Numeric values.
 * lcm(a, b) = |a * b| / gcd(a, b)
 * 
 * @param a First value (will be truncated to integer)
 * @param b Second value (will be truncated to integer)
 * @returns LCM as Numeric
 */
export function lcmNumeric(a: Numeric, b: Numeric): Numeric {
  const x = a.abs().trunc()
  const y = b.abs().trunc()
  const factory = NumericProvider.getGlobalFactory()
  
  if (x.isZero() || y.isZero()) {
    return factory.zero()
  }
  
  return x.times(y).dividedBy(gcdNumeric(x, y))
}

/**
 * Computes the GCD of an array of Numeric values.
 * 
 * @param arr Array of Numeric values
 * @returns GCD of all values as Numeric
 */
export function gcdArrayNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    return NumericProvider.getGlobalFactory().zero()
  }
  let result = arr[0].abs().trunc()
  for (let i = 1; i < arr.length; i++) {
    result = gcdNumeric(result, arr[i])
  }
  return result
}

/**
 * Computes the LCM of an array of Numeric values.
 * 
 * @param arr Array of Numeric values
 * @returns LCM of all values as Numeric
 */
export function lcmArrayNumeric(arr: Numeric[]): Numeric {
  if (arr.length === 0) {
    return NumericProvider.getGlobalFactory().one()
  }
  let result = arr[0].abs().trunc()
  for (let i = 1; i < arr.length; i++) {
    result = lcmNumeric(result, arr[i])
  }
  return result
}

/**
 * Computes the NPV (Net Present Value) of a series of cash flows.
 * NPV = Σ(values[i] / (1 + rate)^(i+1))
 * 
 * @param rate Discount rate as Numeric
 * @param values Array of cash flows as Numeric
 * @returns NPV as Numeric, or null if division by zero
 */
export function npvNumeric(rate: Numeric, values: Numeric[]): Numeric | null {
  const factory = NumericProvider.getGlobalFactory()
  const one = factory.one()
  const minusOne = factory.fromNumber(-1)
  
  // Check for rate === -1 which would cause division by zero
  if (rate.equals(minusOne)) {
    // Check if all values are zero
    let allZero = true
    for (const v of values) {
      if (!v.isZero()) {
        allZero = false
        break
      }
    }
    if (allZero) {
      return factory.zero()
    }
    return null // Division by zero error
  }
  
  let acc = factory.zero()
  const onePlusRate = one.plus(rate)
  
  // Process from end to beginning for numerical stability
  for (let i = values.length - 1; i >= 0; i--) {
    acc = acc.plus(values[i])
    acc = acc.dividedBy(onePlusRate)
  }
  
  return acc
}

/**
 * Computes SUMX2MY2: Sum of (x² - y²) for paired arrays.
 * 
 * @param arrX First array of Numeric values
 * @param arrY Second array of Numeric values (same length as arrX)
 * @returns Sum of differences of squares as Numeric
 */
export function sumX2MinusY2Numeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  let result = factory.zero()
  for (let i = 0; i < arrX.length; i++) {
    const x2 = arrX[i].times(arrX[i])
    const y2 = arrY[i].times(arrY[i])
    result = result.plus(x2.minus(y2))
  }
  return result
}

/**
 * Computes SUMX2PY2: Sum of (x² + y²) for paired arrays.
 * 
 * @param arrX First array of Numeric values
 * @param arrY Second array of Numeric values (same length as arrX)
 * @returns Sum of sums of squares as Numeric
 */
export function sumX2PlusY2Numeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  let result = factory.zero()
  for (let i = 0; i < arrX.length; i++) {
    const x2 = arrX[i].times(arrX[i])
    const y2 = arrY[i].times(arrY[i])
    result = result.plus(x2.plus(y2))
  }
  return result
}

/**
 * Computes SUMXMY2: Sum of (x - y)² for paired arrays.
 * 
 * @param arrX First array of Numeric values
 * @param arrY Second array of Numeric values (same length as arrX)
 * @returns Sum of squared differences as Numeric
 */
export function sumXMinusY2Numeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  let result = factory.zero()
  for (let i = 0; i < arrX.length; i++) {
    const diff = arrX[i].minus(arrY[i])
    result = result.plus(diff.times(diff))
  }
  return result
}

/**
 * Computes SUMPRODUCT: Sum of element-wise products for paired arrays.
 * 
 * @param arrX First array of Numeric values
 * @param arrY Second array of Numeric values (same length as arrX)
 * @returns Sum of products as Numeric
 */
export function sumProductNumeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  let result = factory.zero()
  for (let i = 0; i < arrX.length; i++) {
    result = result.plus(arrX[i].times(arrY[i]))
  }
  return result
}

/**
 * Computes SERIESSUM: x^n * Σ(coef[i] * x^(m*i))
 * 
 * @param x Base value
 * @param n Initial power
 * @param m Power increment
 * @param coefs Array of coefficients
 * @returns Series sum as Numeric
 */
export function seriesSumNumeric(x: Numeric, n: Numeric, m: Numeric, coefs: Numeric[]): Numeric {
  const factory = NumericProvider.getGlobalFactory()
  let result = factory.zero()
  const reversedCoefs = [...coefs].reverse()
  
  for (const coef of reversedCoefs) {
    result = result.times(x.pow(m))
    result = result.plus(coef)
  }
  
  return result.times(x.pow(n))
}

/**
 * Computes correlation coefficient (Pearson's r) for paired arrays.
 * 
 * @param arrX First array of Numeric values
 * @param arrY Second array of Numeric values (same length as arrX)
 * @returns Correlation coefficient as Numeric
 */
export function correlationNumeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  if (arrX.length !== arrY.length || arrX.length === 0) {
    throw new Error('Arrays must have same non-zero length')
  }
  
  const n = NumericProvider.getGlobalFactory().fromNumber(arrX.length)
  const sumX = sumNumeric(arrX)
  const sumY = sumNumeric(arrY)
  const sumXY = sumProductNumeric(arrX, arrY)
  const sumX2 = sumProductNumeric(arrX, arrX)
  const sumY2 = sumProductNumeric(arrY, arrY)
  
  // r = (n*Σxy - Σx*Σy) / sqrt((n*Σx² - (Σx)²) * (n*Σy² - (Σy)²))
  const numerator = n.times(sumXY).minus(sumX.times(sumY))
  const denomX = n.times(sumX2).minus(sumX.times(sumX))
  const denomY = n.times(sumY2).minus(sumY.times(sumY))
  const denominator = denomX.times(denomY).sqrt()
  
  return numerator.dividedBy(denominator)
}

/**
 * Computes covariance for paired arrays.
 * 
 * @param arrX First array of Numeric values
 * @param arrY Second array of Numeric values (same length as arrX)
 * @param sample If true, computes sample covariance (n-1), otherwise population covariance (n)
 * @returns Covariance as Numeric
 */
export function covarianceNumeric(arrX: Numeric[], arrY: Numeric[], sample: boolean = false): Numeric {
  if (arrX.length !== arrY.length || arrX.length === 0) {
    throw new Error('Arrays must have same non-zero length')
  }
  
  const factory = NumericProvider.getGlobalFactory()
  const meanX = meanNumeric(arrX)
  const meanY = meanNumeric(arrY)
  
  let sum = factory.zero()
  for (let i = 0; i < arrX.length; i++) {
    const dx = arrX[i].minus(meanX)
    const dy = arrY[i].minus(meanY)
    sum = sum.plus(dx.times(dy))
  }
  
  const divisor = sample ? arrX.length - 1 : arrX.length
  return sum.dividedBy(factory.fromNumber(divisor))
}

/**
 * Computes the slope of linear regression for paired arrays.
 * slope = Σ((x - meanX)(y - meanY)) / Σ(x - meanX)²
 * 
 * @param arrX Independent variable values
 * @param arrY Dependent variable values
 * @returns Slope as Numeric
 */
export function slopeNumeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  if (arrX.length !== arrY.length || arrX.length === 0) {
    throw new Error('Arrays must have same non-zero length')
  }
  
  const factory = NumericProvider.getGlobalFactory()
  const meanX = meanNumeric(arrX)
  const meanY = meanNumeric(arrY)
  
  let numerator = factory.zero()
  let denominator = factory.zero()
  
  for (let i = 0; i < arrX.length; i++) {
    const dx = arrX[i].minus(meanX)
    const dy = arrY[i].minus(meanY)
    numerator = numerator.plus(dx.times(dy))
    denominator = denominator.plus(dx.times(dx))
  }
  
  return numerator.dividedBy(denominator)
}

/**
 * Computes the intercept of linear regression for paired arrays.
 * intercept = meanY - slope * meanX
 * 
 * @param arrX Independent variable values
 * @param arrY Dependent variable values
 * @returns Intercept as Numeric
 */
export function interceptNumeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  const meanX = meanNumeric(arrX)
  const meanY = meanNumeric(arrY)
  const slope = slopeNumeric(arrX, arrY)
  return meanY.minus(slope.times(meanX))
}

/**
 * Computes R² (coefficient of determination) for paired arrays.
 * 
 * @param arrX Independent variable values
 * @param arrY Dependent variable values
 * @returns R² as Numeric
 */
export function rsqNumeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  const r = correlationNumeric(arrX, arrY)
  return r.times(r)
}

/**
 * Computes STEYX (standard error of the predicted y-value for each x).
 * 
 * @param arrX Independent variable values
 * @param arrY Dependent variable values
 * @returns Standard error as Numeric
 */
export function steyxNumeric(arrX: Numeric[], arrY: Numeric[]): Numeric {
  if (arrX.length !== arrY.length || arrX.length < 3) {
    throw new Error('Arrays must have same length >= 3')
  }
  
  const factory = NumericProvider.getGlobalFactory()
  const n = arrX.length
  const slope = slopeNumeric(arrX, arrY)
  const intercept = interceptNumeric(arrX, arrY)
  
  let sumSqResiduals = factory.zero()
  for (let i = 0; i < n; i++) {
    const predicted = intercept.plus(slope.times(arrX[i]))
    const residual = arrY[i].minus(predicted)
    sumSqResiduals = sumSqResiduals.plus(residual.times(residual))
  }
  
  return sumSqResiduals.dividedBy(factory.fromNumber(n - 2)).sqrt()
}
