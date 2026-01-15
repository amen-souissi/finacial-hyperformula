/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import { simpleCellAddress, SimpleCellAddress } from './Cell'
import { RawCellContent } from './CellContentParser'
import { CellValue, GetCellValueOptions } from './CellValue'
import { Config } from './Config'
import {
  ArrayFormulaVertex,
  DependencyGraph,
  ScalarFormulaVertex,
  ParsingErrorVertex,
} from './DependencyGraph'
import { Exporter } from './Exporter'
import { Maybe } from './Maybe'
import { NamedExpressionOptions, NamedExpressions } from './NamedExpressions'
import { ProcedureAst, Unparser } from './parser'

export interface SerializedNamedExpression {
  name: string,
  expression: RawCellContent,
  scope?: number,
  options?: NamedExpressionOptions,
}

/**
 *
 */
export class Serialization {
  constructor(
    private readonly dependencyGraph: DependencyGraph,
    private readonly unparser: Unparser,
    private readonly exporter: Exporter
  ) {}

  /**
   *
   */
  public getCellHyperlink(address: SimpleCellAddress): Maybe<string> {
    const formulaVertex = this.dependencyGraph.getCell(address)
    if (formulaVertex instanceof ScalarFormulaVertex) {
      const formula = formulaVertex.getFormula(
        this.dependencyGraph.lazilyTransformingAstService
      ) as ProcedureAst
      if ('HYPERLINK' === formula.procedureName) {
        return formula.hyperlink
      }
    }
    return undefined
  }

  /**
   *
   */
  public getCellFormula(
    address: SimpleCellAddress,
    targetAddress?: SimpleCellAddress
  ): Maybe<string> {
    const formulaVertex = this.dependencyGraph.getCell(address)
    if (formulaVertex instanceof ScalarFormulaVertex) {
      const formula = formulaVertex.getFormula(
        this.dependencyGraph.lazilyTransformingAstService
      )
      targetAddress = targetAddress ?? address
      return this.unparser.unparse(formula, targetAddress)
    } else if (formulaVertex instanceof ArrayFormulaVertex) {
      const arrayVertexAddress = formulaVertex.getAddress(
        this.dependencyGraph.lazilyTransformingAstService
      )
      if (
        arrayVertexAddress.row !== address.row ||
        arrayVertexAddress.col !== address.col ||
        arrayVertexAddress.sheet !== address.sheet
      ) {
        return undefined
      }
      targetAddress = targetAddress ?? address
      const formula = formulaVertex.getFormula(
        this.dependencyGraph.lazilyTransformingAstService
      )
      if (formula !== undefined) {
        return this.unparser.unparse(formula, targetAddress)
      }
    } else if (formulaVertex instanceof ParsingErrorVertex) {
      return formulaVertex.getFormula()
    }
    return undefined
  }

  /**
   *
   */
  public getCellSerialized(
    address: SimpleCellAddress,
    targetAddress?: SimpleCellAddress
  ): RawCellContent {
    return (
      this.getCellFormula(address, targetAddress) ?? this.getRawValue(address)
    )
  }

  /**
   * Returns the cell value.
   * By default, returns native JavaScript numbers.
   * Use { keepNumeric: true } to return Numeric objects for full precision.
   *
   * @param address - The cell address
   * @param options - Export options
   * @returns The cell value (number, Numeric, string, boolean, null, or DetailedCellError)
   */
  public getCellValue(
    address: SimpleCellAddress,
    options?: GetCellValueOptions
  ): CellValue {
    return this.exporter.exportValue(
      this.dependencyGraph.getScalarValue(address),
      options
    )
  }

  /**
   *
   */
  public getRawValue(address: SimpleCellAddress): RawCellContent {
    return this.dependencyGraph.getRawValue(address)
  }

  /**
   * Returns all values from a sheet.
   * By default, returns native JavaScript numbers.
   * Use { keepNumeric: true } to return Numeric objects for full precision.
   *
   * @param sheet - The sheet ID
   * @param options - Export options
   * @returns 2D array of cell values
   */
  public getSheetValues(
    sheet: number,
    options?: GetCellValueOptions
  ): CellValue[][] {
    return this.genericSheetGetter(sheet, (arg) =>
      this.getCellValue(arg, options)
    )
  }

  /**
   *
   */
  public getSheetFormulas(sheet: number): Maybe<string>[][] {
    return this.genericSheetGetter(sheet, (arg) => this.getCellFormula(arg))
  }

  /**
   *
   */
  public genericSheetGetter<T>(
    sheet: number,
    getter: (address: SimpleCellAddress) => T
  ): T[][] {
    const sheetHeight = this.dependencyGraph.getSheetHeight(sheet)
    const sheetWidth = this.dependencyGraph.getSheetWidth(sheet)

    const arr: T[][] = new Array(sheetHeight)
    for (let i = 0; i < sheetHeight; i++) {
      arr[i] = new Array(sheetWidth)

      for (let j = 0; j < sheetWidth; j++) {
        const address = simpleCellAddress(sheet, j, i)
        arr[i][j] = getter(address)
      }
      for (let j = sheetWidth - 1; j >= 0; j--) {
        if (arr[i][j] === null || arr[i][j] === undefined) {
          arr[i].pop()
        } else {
          break
        }
      }
    }

    for (let i = sheetHeight - 1; i >= 0; i--) {
      if (arr[i].length === 0) {
        arr.pop()
      } else {
        break
      }
    }
    return arr
  }

  /**
   *
   */
  public genericAllSheetsGetter<T>(
    sheetGetter: (sheet: number) => T
  ): Record<string, T> {
    const result: Record<string, T> = {}
    for (const sheetName of this.dependencyGraph.sheetMapping.iterateSheetNames()) {
      const sheetId =
        this.dependencyGraph.sheetMapping.getSheetIdOrThrowError(sheetName)
      result[sheetName] = sheetGetter(sheetId)
    }
    return result
  }

  /**
   *
   */
  public getSheetSerialized(sheet: number): RawCellContent[][] {
    return this.genericSheetGetter(sheet, (arg) => this.getCellSerialized(arg))
  }

  /**
   * Returns all values from all sheets.
   * By default, returns native JavaScript numbers.
   * Use { keepNumeric: true } to return Numeric objects for full precision.
   *
   * @param options - Export options
   * @returns Record of sheet names to 2D arrays of cell values
   */
  public getAllSheetsValues(
    options?: GetCellValueOptions
  ): Record<string, CellValue[][]> {
    return this.genericAllSheetsGetter((arg) =>
      this.getSheetValues(arg, options)
    )
  }

  /**
   *
   */
  public getAllSheetsFormulas(): Record<string, Maybe<string>[][]> {
    return this.genericAllSheetsGetter((arg) => this.getSheetFormulas(arg))
  }

  /**
   *
   */
  public getAllSheetsSerialized(): Record<string, RawCellContent[][]> {
    return this.genericAllSheetsGetter((arg) => this.getSheetSerialized(arg))
  }

  /**
   *
   */
  public getAllNamedExpressionsSerialized(): SerializedNamedExpression[] {
    const idMap: number[] = []
    let id = 0
    for (const sheetName of this.dependencyGraph.sheetMapping.iterateSheetNames()) {
      const sheetId =
        this.dependencyGraph.sheetMapping.getSheetIdOrThrowError(sheetName)
      idMap[sheetId] = id
      id++
    }
    return this.dependencyGraph.namedExpressions
      .getAllNamedExpressions()
      .map((entry) => {
        return {
          name: entry.expression.displayName,
          expression: this.getCellSerialized(entry.expression.address),
          scope: entry.scope !== undefined ? idMap[entry.scope] : undefined,
          options: entry.expression.options,
        }
      })
  }

  /**
   *
   */
  public withNewConfig(
    newConfig: Config,
    namedExpressions: NamedExpressions
  ): Serialization {
    const newUnparser = new Unparser(
      newConfig,
      this.dependencyGraph.sheetMapping,
      namedExpressions
    )
    return new Serialization(this.dependencyGraph, newUnparser, this.exporter)
  }
}
