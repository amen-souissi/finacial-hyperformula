/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import { CellError, ErrorType, SimpleCellAddress } from './Cell'
import { CellValue, GetCellValueOptions, DetailedCellError } from './CellValue'
import { Config } from './Config'
import { CellValueChange, ChangeExporter } from './ContentChanges'
import { ErrorMessage } from './error-message'
import {
  EmptyValue,
  getRawPrecisionValue,
  InterpreterValue,
  isExtendedNumber,
  toNativeNumeric,
} from './interpreter/InterpreterValue'
import { SimpleRangeValue } from './SimpleRangeValue'
import { LazilyTransformingAstService } from './LazilyTransformingAstService'
import { NamedExpressions } from './NamedExpressions'
import { simpleCellAddressToString } from './parser/addressRepresentationConverters'
import { SheetMapping } from './DependencyGraph/SheetMapping'

export type ExportedChange = ExportedCellChange | ExportedNamedExpressionChange

/**
 * A list of cells which values changed after the operation, their absolute addresses and new values.
 */
export class ExportedCellChange {
  constructor(
    public readonly address: SimpleCellAddress,
    public readonly newValue: CellValue
  ) {}

  /**
   *
   */
  public get col() {
    return this.address.col
  }

  /**
   *
   */
  public get row() {
    return this.address.row
  }

  /**
   *
   */
  public get sheet() {
    return this.address.sheet
  }

  /**
   *
   */
  public get value() {
    return this.newValue
  }
}

/**
 *
 */
export class ExportedNamedExpressionChange {
  constructor(
    public readonly name: string,
    public readonly newValue: CellValue | CellValue[][]
  ) {}
}

/**
 *
 */
export class Exporter implements ChangeExporter<ExportedChange> {
  constructor(
    private readonly config: Config,
    private readonly namedExpressions: NamedExpressions,
    private readonly sheetMapping: SheetMapping,
    private readonly lazilyTransformingService: LazilyTransformingAstService
  ) {}

  /**
   * Export a cell value change for the changes array.
   * Note: ExportedChange uses CellValue (native numbers) for backward compatibility.
   */
  public exportChange(
    change: CellValueChange
  ): ExportedChange | ExportedChange[] {
    const value = change.value
    const address = change.address

    if (address.sheet === NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS) {
      const namedExpression = this.namedExpressions.namedExpressionInAddress(
        address.row
      )
      if (!namedExpression) {
        throw new Error('Missing named expression')
      }
      return new ExportedNamedExpressionChange(
        namedExpression.displayName,
        this.exportScalarOrRange(value)
      )
    } else if (value instanceof SimpleRangeValue) {
      const result: ExportedChange[] = []
      for (const [cellValue, cellAddress] of value.entriesFromTopLeftCorner(
        address
      )) {
        result.push(
          new ExportedCellChange(cellAddress, this.exportValue(cellValue))
        )
      }
      return result
    } else {
      return new ExportedCellChange(address, this.exportValue(value))
    }
  }

  /**
   * Export internal value to public API type.
   *
   * By default, returns native JavaScript numbers.
   * Use { keepNumeric: true } to return Numeric objects for full precision.
   *
   * @param {InterpreterValue} value - The interpreter value to export
   * @param {GetCellValueOptions} options - Export options
   * @returns {CellValue} The exported value (number, Numeric, string, boolean, null, or DetailedCellError)
   */
  public exportValue(
    value: InterpreterValue,
    options?: GetCellValueOptions
  ): CellValue {
    const keepNumeric = options?.keepNumeric ?? false

    if (value instanceof SimpleRangeValue) {
      return this.detailedError(
        new CellError(ErrorType.VALUE, ErrorMessage.ScalarExpected)
      )
    } else if (value instanceof CellError) {
      return this.detailedError(value)
    } else if (value === EmptyValue) {
      return null
    } else if (isExtendedNumber(value)) {
      const precisionValue = getRawPrecisionValue(value)
      if (keepNumeric) {
        // PRESERVE PRECISION: Return the Numeric object for continued precise calculations
        return precisionValue
      } else if (this.config.smartRounding) {
        // Smart rounding for display - converts to native number
        return this.cellValueRounding(toNativeNumeric(precisionValue))
      } else {
        // Convert to native JavaScript number
        return toNativeNumeric(precisionValue)
      }
    } else if (typeof value === 'boolean') {
      return value
    } else {
      return value
    }
  }

  /**
   * Export scalar or range value.
   *
   * By default, returns native JavaScript numbers.
   * Use { keepNumeric: true } to return Numeric objects for full precision.
   *
   * @param {InterpreterValue} value - The interpreter value to export
   * @param {GetCellValueOptions} options - Export options
   * @returns {CellValue | CellValue[][]} The exported value or 2D array of values
   */
  public exportScalarOrRange(
    value: InterpreterValue,
    options?: GetCellValueOptions
  ): CellValue | CellValue[][] {
    if (value instanceof SimpleRangeValue) {
      return value
        .rawData()
        .map((row) => row.map((v) => this.exportValue(v, options)))
    } else {
      return this.exportValue(value, options)
    }
  }

  /**
   *
   */
  private detailedError(error: CellError): DetailedCellError {
    let address = undefined
    const originAddress = error.root?.getAddress(
      this.lazilyTransformingService
    )
    if (originAddress !== undefined) {
      if (
        originAddress.sheet === NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS
      ) {
        address = this.namedExpressions.namedExpressionInAddress(
          originAddress.row
        )?.displayName
      } else {
        address = simpleCellAddressToString(
          this.sheetMapping.getSheetNameOrThrowError.bind(this.sheetMapping),
          originAddress,
          -1
        )
      }
    }
    return new DetailedCellError(
      error,
      this.config.translationPackage.getErrorTranslation(error.type),
      address
    )
  }

  /**
   *
   */
  private cellValueRounding(value: number): number {
    if (value === 0) {
      return value
    }
    const magnitudeMultiplierExponent = Math.floor(Math.log10(Math.abs(value)))
    const placesMultiplier = Math.pow(
      10,
      this.config.precisionRounding - magnitudeMultiplierExponent
    )
    if (value < 0) {
      return -Math.round(-value * placesMultiplier) / placesMultiplier
    } else {
      return Math.round(value * placesMultiplier) / placesMultiplier
    }
  }
}
