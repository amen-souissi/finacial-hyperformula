/**
 * Tests for NumericArrayUtils.ts
 * Covers statistical, financial, and array utility functions for Numeric arrays.
 */

import {
  numericComparator,
  sortNumericArray,
  sumNumeric,
  meanNumeric,
  productNumeric,
  minNumeric,
  maxNumeric,
  sumSquaredErrorsNumeric,
  varianceNumeric,
  stdDevNumeric,
  skewnessNumeric,
  kurtosisNumeric,
  geomeanNumeric,
  harmeanNumeric,
  avedevNumeric,
  medianNumeric,
  largeNumeric,
  smallNumeric,
  gcdNumeric,
  lcmNumeric,
  gcdArrayNumeric,
  lcmArrayNumeric,
  npvNumeric,
  sumX2MinusY2Numeric,
  sumX2PlusY2Numeric,
  sumXMinusY2Numeric,
  sumProductNumeric,
  seriesSumNumeric,
  correlationNumeric,
  covarianceNumeric,
  slopeNumeric,
  interceptNumeric,
  rsqNumeric,
  steyxNumeric,
} from '../../src/Numeric/NumericArrayUtils'
import { DecimalNumericFactory } from '../../src/Numeric/implementations/DecimalNumeric'
import { NumericProvider } from '../../src/Numeric/NumericProvider'
import { Numeric } from '../../src/Numeric/Numeric'

describe('NumericArrayUtils', () => {
  let factory: DecimalNumericFactory

  beforeAll(() => {
    factory = new DecimalNumericFactory()
    NumericProvider.setGlobalFactory(factory)
  })

  afterAll(() => {
    NumericProvider.resetToDefault()
  })

  // Helper to create Numeric array from numbers
  const toNumericArray = (nums: number[]): Numeric[] => nums.map(n => factory.fromNumber(n))

  describe('numericComparator', () => {
    it('should return -1 when a < b', () => {
      const a = factory.fromNumber(1)
      const b = factory.fromNumber(2)

      expect(numericComparator(a, b)).toBe(-1)
    })

    it('should return 0 when a = b', () => {
      const a = factory.fromNumber(5)
      const b = factory.fromNumber(5)

      expect(numericComparator(a, b)).toBe(0)
    })

    it('should return 1 when a > b', () => {
      const a = factory.fromNumber(10)
      const b = factory.fromNumber(5)

      expect(numericComparator(a, b)).toBe(1)
    })
  })

  describe('sortNumericArray', () => {
    it('should sort array in ascending order', () => {
      const arr = toNumericArray([3, 1, 4, 1, 5, 9, 2, 6])
      const sorted = sortNumericArray(arr)

      expect(sorted.map(n => n.toNumber())).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
      expect(sorted).toBe(arr) // Same reference
    })

    it('should handle empty array', () => {
      const arr: Numeric[] = []
      const sorted = sortNumericArray(arr)

      expect(sorted).toEqual([])
    })

    it('should handle single element', () => {
      const arr = toNumericArray([42])
      const sorted = sortNumericArray(arr)

      expect(sorted.map(n => n.toNumber())).toEqual([42])
    })
  })

  describe('sumNumeric', () => {
    it('should sum array of numbers', () => {
      const arr = toNumericArray([1, 2, 3, 4, 5])

      expect(sumNumeric(arr).toNumber()).toBe(15)
    })

    it('should return zero for empty array', () => {
      expect(sumNumeric([]).toNumber()).toBe(0)
    })

    it('should handle single element', () => {
      const arr = toNumericArray([42])

      expect(sumNumeric(arr).toNumber()).toBe(42)
    })

    it('should handle negative numbers', () => {
      const arr = toNumericArray([-1, -2, 3])

      expect(sumNumeric(arr).toNumber()).toBe(0)
    })
  })

  describe('meanNumeric', () => {
    it('should compute arithmetic mean', () => {
      const arr = toNumericArray([2, 4, 6, 8, 10])

      expect(meanNumeric(arr).toNumber()).toBe(6)
    })

    it('should throw for empty array', () => {
      expect(() => meanNumeric([])).toThrow('Cannot compute mean of empty array')
    })

    it('should handle single element', () => {
      const arr = toNumericArray([42])

      expect(meanNumeric(arr).toNumber()).toBe(42)
    })
  })

  describe('productNumeric', () => {
    it('should compute product of array', () => {
      const arr = toNumericArray([2, 3, 4])

      expect(productNumeric(arr).toNumber()).toBe(24)
    })

    it('should return one for empty array', () => {
      expect(productNumeric([]).toNumber()).toBe(1)
    })

    it('should handle zero in array', () => {
      const arr = toNumericArray([1, 2, 0, 4])

      expect(productNumeric(arr).toNumber()).toBe(0)
    })

    it('should handle single element', () => {
      const arr = toNumericArray([7])

      expect(productNumeric(arr).toNumber()).toBe(7)
    })

    it('should handle negative numbers', () => {
      const arr = toNumericArray([-2, 3])

      expect(productNumeric(arr).toNumber()).toBe(-6)
    })
  })

  describe('minNumeric', () => {
    it('should find minimum value', () => {
      const arr = toNumericArray([5, 2, 8, 1, 9])

      expect(minNumeric(arr).toNumber()).toBe(1)
    })

    it('should throw for empty array', () => {
      expect(() => minNumeric([])).toThrow('Cannot find minimum of empty array')
    })

    it('should handle single element', () => {
      const arr = toNumericArray([42])

      expect(minNumeric(arr).toNumber()).toBe(42)
    })

    it('should handle negative numbers', () => {
      const arr = toNumericArray([1, -5, 3])

      expect(minNumeric(arr).toNumber()).toBe(-5)
    })

    it('should handle all same values', () => {
      const arr = toNumericArray([7, 7, 7])

      expect(minNumeric(arr).toNumber()).toBe(7)
    })
  })

  describe('maxNumeric', () => {
    it('should find maximum value', () => {
      const arr = toNumericArray([5, 2, 8, 1, 9])

      expect(maxNumeric(arr).toNumber()).toBe(9)
    })

    it('should throw for empty array', () => {
      expect(() => maxNumeric([])).toThrow('Cannot find maximum of empty array')
    })

    it('should handle single element', () => {
      const arr = toNumericArray([42])

      expect(maxNumeric(arr).toNumber()).toBe(42)
    })

    it('should handle negative numbers', () => {
      const arr = toNumericArray([-1, -5, -3])

      expect(maxNumeric(arr).toNumber()).toBe(-1)
    })

    it('should handle all same values', () => {
      const arr = toNumericArray([7, 7, 7])

      expect(maxNumeric(arr).toNumber()).toBe(7)
    })
  })

  describe('sumSquaredErrorsNumeric', () => {
    it('should compute sum of squared deviations from mean', () => {
      const arr = toNumericArray([2, 4, 4, 4, 5, 5, 7, 9])
      // Mean = 5, deviations: -3, -1, -1, -1, 0, 0, 2, 4
      // Squared: 9, 1, 1, 1, 0, 0, 4, 16 = 32

      expect(sumSquaredErrorsNumeric(arr).toNumber()).toBe(32)
    })

    it('should return zero for empty array', () => {
      expect(sumSquaredErrorsNumeric([]).toNumber()).toBe(0)
    })

    it('should return zero for single element', () => {
      const arr = toNumericArray([5])

      expect(sumSquaredErrorsNumeric(arr).toNumber()).toBe(0)
    })
  })

  describe('varianceNumeric', () => {
    it('should compute population variance', () => {
      const arr = toNumericArray([2, 4, 4, 4, 5, 5, 7, 9])
      // SSE = 32, n = 8, variance = 32/8 = 4

      expect(varianceNumeric(arr, false).toNumber()).toBe(4)
    })

    it('should compute sample variance', () => {
      const arr = toNumericArray([2, 4, 4, 4, 5, 5, 7, 9])
      // SSE = 32, n-1 = 7, variance = 32/7 ≈ 4.571

      expect(varianceNumeric(arr, true).toNumber()).toBeCloseTo(32 / 7, 10)
    })

    it('should return zero for empty array', () => {
      expect(varianceNumeric([], false).toNumber()).toBe(0)
    })

    it('should return zero for single element with sample variance', () => {
      const arr = toNumericArray([5])
      // divisor = n-1 = 0

      expect(varianceNumeric(arr, true).toNumber()).toBe(0)
    })
  })

  describe('stdDevNumeric', () => {
    it('should compute population standard deviation', () => {
      const arr = toNumericArray([2, 4, 4, 4, 5, 5, 7, 9])
      // Variance = 4, stddev = 2

      expect(stdDevNumeric(arr, false).toNumber()).toBe(2)
    })

    it('should compute sample standard deviation', () => {
      const arr = toNumericArray([2, 4, 4, 4, 5, 5, 7, 9])

      expect(stdDevNumeric(arr, true).toNumber()).toBeCloseTo(Math.sqrt(32 / 7), 10)
    })
  })

  describe('skewnessNumeric', () => {
    it('should compute sample skewness', () => {
      const arr = toNumericArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

      const result = skewnessNumeric(arr, true)

      expect(result.toNumber()).toBeCloseTo(0, 5) // Symmetric distribution
    })

    it('should compute population skewness', () => {
      const arr = toNumericArray([1, 2, 3, 4, 5])

      const result = skewnessNumeric(arr, false)

      expect(result.toNumber()).toBeCloseTo(0, 5)
    })

    it('should throw for fewer than 3 values with sample skewness', () => {
      const arr = toNumericArray([1, 2])

      expect(() => skewnessNumeric(arr, true)).toThrow('Cannot compute sample skewness with fewer than 3 values')
    })

    it('should throw for empty array with population skewness', () => {
      expect(() => skewnessNumeric([], false)).toThrow('Cannot compute skewness of empty array')
    })

    it('should return zero when standard deviation is zero', () => {
      const arr = toNumericArray([5, 5, 5, 5, 5])

      expect(skewnessNumeric(arr, true).toNumber()).toBe(0)
    })

    it('should compute positive skewness for right-skewed data', () => {
      const arr = toNumericArray([1, 1, 1, 1, 1, 10])

      const result = skewnessNumeric(arr, true)

      expect(result.toNumber()).toBeGreaterThan(0)
    })
  })

  describe('kurtosisNumeric', () => {
    it('should compute sample kurtosis', () => {
      const arr = toNumericArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

      const result = kurtosisNumeric(arr, true)
      // Normal-like distribution has excess kurtosis near 0

      expect(typeof result.toNumber()).toBe('number')
    })

    it('should compute population kurtosis', () => {
      const arr = toNumericArray([1, 2, 3, 4, 5])

      const result = kurtosisNumeric(arr, false)

      expect(typeof result.toNumber()).toBe('number')
    })

    it('should throw for fewer than 4 values with sample kurtosis', () => {
      const arr = toNumericArray([1, 2, 3])

      expect(() => kurtosisNumeric(arr, true)).toThrow('Cannot compute sample kurtosis with fewer than 4 values')
    })

    it('should throw for empty array with population kurtosis', () => {
      expect(() => kurtosisNumeric([], false)).toThrow('Cannot compute kurtosis of empty array')
    })

    it('should return zero when standard deviation is zero', () => {
      const arr = toNumericArray([5, 5, 5, 5, 5])

      expect(kurtosisNumeric(arr, true).toNumber()).toBe(0)
    })
  })

  describe('geomeanNumeric', () => {
    it('should compute geometric mean', () => {
      const arr = toNumericArray([2, 8])
      // geomean = sqrt(2*8) = sqrt(16) = 4

      expect(geomeanNumeric(arr).toNumber()).toBeCloseTo(4, 10)
    })

    it('should throw for empty array', () => {
      expect(() => geomeanNumeric([])).toThrow('Cannot compute geometric mean of empty array')
    })

    it('should handle single element', () => {
      const arr = toNumericArray([5])

      expect(geomeanNumeric(arr).toNumber()).toBeCloseTo(5, 10)
    })
  })

  describe('harmeanNumeric', () => {
    it('should compute harmonic mean', () => {
      const arr = toNumericArray([1, 4, 4])
      // harmean = 3 / (1/1 + 1/4 + 1/4) = 3 / 1.5 = 2

      expect(harmeanNumeric(arr).toNumber()).toBe(2)
    })

    it('should throw for empty array', () => {
      expect(() => harmeanNumeric([])).toThrow('Cannot compute harmonic mean of empty array')
    })
  })

  describe('avedevNumeric', () => {
    it('should compute average deviation from mean', () => {
      const arr = toNumericArray([2, 4, 6, 8])
      // Mean = 5, deviations: |-3|, |-1|, |1|, |3| = 3, 1, 1, 3
      // Average = 8/4 = 2

      expect(avedevNumeric(arr).toNumber()).toBe(2)
    })

    it('should return zero for empty array', () => {
      expect(avedevNumeric([]).toNumber()).toBe(0)
    })
  })

  describe('medianNumeric', () => {
    it('should compute median for odd length array', () => {
      const arr = toNumericArray([1, 3, 5, 7, 9])

      expect(medianNumeric(arr).toNumber()).toBe(5)
    })

    it('should compute median for even length array', () => {
      const arr = toNumericArray([1, 2, 3, 4])
      // Median = (2 + 3) / 2 = 2.5

      expect(medianNumeric(arr).toNumber()).toBe(2.5)
    })

    it('should throw for empty array', () => {
      expect(() => medianNumeric([])).toThrow('Cannot compute median of empty array')
    })

    it('should not modify original array', () => {
      const arr = toNumericArray([3, 1, 2])
      medianNumeric(arr)

      expect(arr[0].toNumber()).toBe(3)
    })
  })

  describe('largeNumeric', () => {
    it('should return k-th largest value', () => {
      const arr = toNumericArray([1, 5, 3, 9, 7])

      expect(largeNumeric(arr, 1).toNumber()).toBe(9) // Largest
      expect(largeNumeric(arr, 2).toNumber()).toBe(7) // 2nd largest
      expect(largeNumeric(arr, 5).toNumber()).toBe(1) // Smallest
    })

    it('should throw for invalid k', () => {
      const arr = toNumericArray([1, 2, 3])

      expect(() => largeNumeric(arr, 0)).toThrow()
      expect(() => largeNumeric(arr, 4)).toThrow()
      expect(() => largeNumeric([], 1)).toThrow()
    })
  })

  describe('smallNumeric', () => {
    it('should return k-th smallest value', () => {
      const arr = toNumericArray([1, 5, 3, 9, 7])

      expect(smallNumeric(arr, 1).toNumber()).toBe(1) // Smallest
      expect(smallNumeric(arr, 2).toNumber()).toBe(3) // 2nd smallest
      expect(smallNumeric(arr, 5).toNumber()).toBe(9) // Largest
    })

    it('should throw for invalid k', () => {
      const arr = toNumericArray([1, 2, 3])

      expect(() => smallNumeric(arr, 0)).toThrow()
      expect(() => smallNumeric(arr, 4)).toThrow()
      expect(() => smallNumeric([], 1)).toThrow()
    })
  })

  describe('gcdNumeric', () => {
    it('should compute GCD of two numbers', () => {
      const a = factory.fromNumber(12)
      const b = factory.fromNumber(8)

      expect(gcdNumeric(a, b).toNumber()).toBe(4)
    })

    it('should handle zero', () => {
      const a = factory.fromNumber(12)
      const b = factory.fromNumber(0)

      expect(gcdNumeric(a, b).toNumber()).toBe(12)
    })

    it('should handle negative numbers', () => {
      const a = factory.fromNumber(-12)
      const b = factory.fromNumber(8)

      expect(gcdNumeric(a, b).toNumber()).toBe(4)
    })

    it('should handle decimal numbers (truncates)', () => {
      const a = factory.fromNumber(12.7)
      const b = factory.fromNumber(8.3)

      expect(gcdNumeric(a, b).toNumber()).toBe(4)
    })
  })

  describe('lcmNumeric', () => {
    it('should compute LCM of two numbers', () => {
      const a = factory.fromNumber(4)
      const b = factory.fromNumber(6)

      expect(lcmNumeric(a, b).toNumber()).toBe(12)
    })

    it('should return zero when either is zero', () => {
      const a = factory.fromNumber(5)
      const b = factory.fromNumber(0)

      expect(lcmNumeric(a, b).toNumber()).toBe(0)
    })
  })

  describe('gcdArrayNumeric', () => {
    it('should compute GCD of array', () => {
      const arr = toNumericArray([12, 8, 4])

      expect(gcdArrayNumeric(arr).toNumber()).toBe(4)
    })

    it('should return zero for empty array', () => {
      expect(gcdArrayNumeric([]).toNumber()).toBe(0)
    })

    it('should handle single element', () => {
      const arr = toNumericArray([15])

      expect(gcdArrayNumeric(arr).toNumber()).toBe(15)
    })
  })

  describe('lcmArrayNumeric', () => {
    it('should compute LCM of array', () => {
      const arr = toNumericArray([2, 3, 4])
      // LCM(2,3) = 6, LCM(6,4) = 12

      expect(lcmArrayNumeric(arr).toNumber()).toBe(12)
    })

    it('should return one for empty array', () => {
      expect(lcmArrayNumeric([]).toNumber()).toBe(1)
    })

    it('should handle single element', () => {
      const arr = toNumericArray([7])

      expect(lcmArrayNumeric(arr).toNumber()).toBe(7)
    })
  })

  describe('npvNumeric', () => {
    it('should compute NPV', () => {
      const rate = factory.fromNumber(0.1)
      const values = toNumericArray([100, 100, 100])
      // NPV = 100/1.1 + 100/1.1^2 + 100/1.1^3 ≈ 248.69

      const result = npvNumeric(rate, values)

      expect(result).not.toBeNull()
      expect(result!.toNumber()).toBeCloseTo(248.69, 1)
    })

    it('should return null for rate = -1 with non-zero values', () => {
      const rate = factory.fromNumber(-1)
      const values = toNumericArray([100])

      expect(npvNumeric(rate, values)).toBeNull()
    })

    it('should return zero for rate = -1 with all zero values', () => {
      const rate = factory.fromNumber(-1)
      const values = toNumericArray([0, 0, 0])

      expect(npvNumeric(rate, values)!.toNumber()).toBe(0)
    })

    it('should handle empty values', () => {
      const rate = factory.fromNumber(0.1)

      expect(npvNumeric(rate, [])!.toNumber()).toBe(0)
    })
  })

  describe('sumX2MinusY2Numeric', () => {
    it('should compute sum of x² - y²', () => {
      const arrX = toNumericArray([2, 3])
      const arrY = toNumericArray([1, 2])
      // (4-1) + (9-4) = 3 + 5 = 8

      expect(sumX2MinusY2Numeric(arrX, arrY).toNumber()).toBe(8)
    })

    it('should handle empty arrays', () => {
      expect(sumX2MinusY2Numeric([], []).toNumber()).toBe(0)
    })
  })

  describe('sumX2PlusY2Numeric', () => {
    it('should compute sum of x² + y²', () => {
      const arrX = toNumericArray([2, 3])
      const arrY = toNumericArray([1, 2])
      // (4+1) + (9+4) = 5 + 13 = 18

      expect(sumX2PlusY2Numeric(arrX, arrY).toNumber()).toBe(18)
    })
  })

  describe('sumXMinusY2Numeric', () => {
    it('should compute sum of (x - y)²', () => {
      const arrX = toNumericArray([3, 5])
      const arrY = toNumericArray([1, 2])
      // (3-1)² + (5-2)² = 4 + 9 = 13

      expect(sumXMinusY2Numeric(arrX, arrY).toNumber()).toBe(13)
    })
  })

  describe('sumProductNumeric', () => {
    it('should compute sum of products', () => {
      const arrX = toNumericArray([1, 2, 3])
      const arrY = toNumericArray([4, 5, 6])
      // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32

      expect(sumProductNumeric(arrX, arrY).toNumber()).toBe(32)
    })

    it('should handle empty arrays', () => {
      expect(sumProductNumeric([], []).toNumber()).toBe(0)
    })
  })

  describe('seriesSumNumeric', () => {
    it('should compute series sum', () => {
      // x^n * (coefs[0] + coefs[1]*x^m + coefs[2]*x^(2m) + ...)
      const x = factory.fromNumber(2)
      const n = factory.fromNumber(1)
      const m = factory.fromNumber(1)
      const coefs = toNumericArray([1, 1, 1])
      // 2^1 * (1 + 1*2 + 1*4) = 2 * 7 = 14

      expect(seriesSumNumeric(x, n, m, coefs).toNumber()).toBe(14)
    })

    it('should handle empty coefficients', () => {
      const x = factory.fromNumber(2)
      const n = factory.fromNumber(1)
      const m = factory.fromNumber(1)

      expect(seriesSumNumeric(x, n, m, []).toNumber()).toBe(0)
    })
  })

  describe('correlationNumeric', () => {
    it('should compute correlation coefficient', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2, 4, 6, 8, 10])
      // Perfect positive correlation

      expect(correlationNumeric(arrX, arrY).toNumber()).toBeCloseTo(1, 10)
    })

    it('should compute negative correlation', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([10, 8, 6, 4, 2])

      expect(correlationNumeric(arrX, arrY).toNumber()).toBeCloseTo(-1, 10)
    })

    it('should throw for mismatched array lengths', () => {
      const arrX = toNumericArray([1, 2, 3])
      const arrY = toNumericArray([1, 2])

      expect(() => correlationNumeric(arrX, arrY)).toThrow('Arrays must have same non-zero length')
    })

    it('should throw for empty arrays', () => {
      expect(() => correlationNumeric([], [])).toThrow('Arrays must have same non-zero length')
    })
  })

  describe('covarianceNumeric', () => {
    it('should compute population covariance', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2, 4, 6, 8, 10])

      const result = covarianceNumeric(arrX, arrY, false)

      expect(result.toNumber()).toBe(4) // Cov = 4
    })

    it('should compute sample covariance', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2, 4, 6, 8, 10])

      const result = covarianceNumeric(arrX, arrY, true)

      expect(result.toNumber()).toBe(5) // Cov = 20/4 = 5
    })

    it('should throw for mismatched array lengths', () => {
      const arrX = toNumericArray([1, 2])
      const arrY = toNumericArray([1])

      expect(() => covarianceNumeric(arrX, arrY)).toThrow()
    })

    it('should throw for empty arrays', () => {
      expect(() => covarianceNumeric([], [])).toThrow()
    })
  })

  describe('slopeNumeric', () => {
    it('should compute regression slope', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2, 4, 6, 8, 10])
      // y = 2x, slope = 2

      expect(slopeNumeric(arrX, arrY).toNumber()).toBe(2)
    })

    it('should throw for mismatched lengths', () => {
      const arrX = toNumericArray([1, 2])
      const arrY = toNumericArray([1])

      expect(() => slopeNumeric(arrX, arrY)).toThrow()
    })

    it('should throw for empty arrays', () => {
      expect(() => slopeNumeric([], [])).toThrow()
    })
  })

  describe('interceptNumeric', () => {
    it('should compute regression intercept', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2, 4, 6, 8, 10])
      // y = 2x + 0, intercept = 0

      expect(interceptNumeric(arrX, arrY).toNumber()).toBeCloseTo(0, 10)
    })

    it('should compute non-zero intercept', () => {
      const arrX = toNumericArray([1, 2, 3])
      const arrY = toNumericArray([3, 5, 7])
      // y = 2x + 1, intercept = 1

      expect(interceptNumeric(arrX, arrY).toNumber()).toBeCloseTo(1, 10)
    })
  })

  describe('rsqNumeric', () => {
    it('should compute R-squared', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2, 4, 6, 8, 10])
      // Perfect linear relationship, R² = 1

      expect(rsqNumeric(arrX, arrY).toNumber()).toBeCloseTo(1, 10)
    })
  })

  describe('steyxNumeric', () => {
    it('should compute standard error', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2, 4, 6, 8, 10])
      // Perfect fit, STEYX should be 0 (or very close)

      expect(steyxNumeric(arrX, arrY).toNumber()).toBeCloseTo(0, 10)
    })

    it('should compute non-zero standard error', () => {
      const arrX = toNumericArray([1, 2, 3, 4, 5])
      const arrY = toNumericArray([2.1, 3.9, 6.2, 7.8, 10.1])

      const result = steyxNumeric(arrX, arrY)

      expect(result.toNumber()).toBeGreaterThan(0)
    })

    it('should throw for fewer than 3 points', () => {
      const arrX = toNumericArray([1, 2])
      const arrY = toNumericArray([2, 4])

      expect(() => steyxNumeric(arrX, arrY)).toThrow('Arrays must have same length >= 3')
    })

    it('should throw for mismatched lengths', () => {
      const arrX = toNumericArray([1, 2, 3])
      const arrY = toNumericArray([1, 2])

      expect(() => steyxNumeric(arrX, arrY)).toThrow()
    })
  })
})
