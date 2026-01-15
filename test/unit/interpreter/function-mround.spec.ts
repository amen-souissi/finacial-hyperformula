import {HyperFormula} from '../../../src'
import {ErrorType} from '../../../src/Cell'
import {ErrorMessage} from '../../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function MROUND', () => {
  it('should not work for wrong number of arguments', () => {
    const engine = HyperFormula.buildFromArray([
      ['=MROUND(101)'],
      ['=MROUND(1, 2, 3)'],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for arguments of wrong type', () => {
    const engine = HyperFormula.buildFromArray([
      ['=MROUND(1, "foo")'],
      ['=MROUND("bar", 4)'],
      ['=MROUND("foo", "baz")'],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return 0 when dividing by 0', () => {
    const engine = HyperFormula.buildFromArray([
      ['=MROUND(42, 0)'],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(0)
  })

  it('should return error for args of different signs', () => {
    const engine = HyperFormula.buildFromArray([
      ['=MROUND(42, -1)'],
      ['=MROUND(-42, 1)'],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DistinctSigns))
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DistinctSigns))
  })

  it('should work', () => {
    const engine = HyperFormula.buildFromArray([
      ['=MROUND(5, 2)'],
      ['=MROUND(36, 6.5)'],
      ['=MROUND(10.5, 3)'],
      ['=MROUND(-5, -2)'],
      ['=MROUND(-36, -6.5)'],
      ['=MROUND(-10.5, -3)'],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(6)
    expect(engine.getCellValue(adr('A2'))).toBe(39)
    expect(engine.getCellValue(adr('A3'))).toBe(12)
    expect(engine.getCellValue(adr('A4'))).toBe(-6)
    expect(engine.getCellValue(adr('A5'))).toBe(-39)
    expect(engine.getCellValue(adr('A6'))).toBe(-12)
  })

  /**
   * Tests below verify that high-precision Numeric arithmetic avoids floating point errors.
   * With native floating point, MROUND(6.05, 0.1) would incorrectly return 6 due to
   * 6.05/0.1 = 60.4999... (floating point error). With Numeric, we get the correct 6.1.
   */
  it('high precision arithmetic', () => {
    const engine = HyperFormula.buildFromArray([
      ['=MROUND(6.05, 0.1)'],
      ['=MROUND(7.05, 0.1)'],
    ])

    // With high-precision Numeric, these now return correct results
    expect(engine.getCellValue(adr('A1'))).toBe(6.1)
    expect(engine.getCellValue(adr('A2'))).toBe(7.1)
  })
})
