/**
 * @license
 * Copyright (c) 2025 Handsoncode. All rights reserved.
 */

import { CellError, ErrorType } from './Cell'
import { Numeric } from './Numeric'

export type NoErrorCellValue = number | string | boolean | null
export type CellValue = NoErrorCellValue | Numeric | DetailedCellError

/**
 * Options for getCellValue and related methods that return cell values.
 */
export interface GetCellValueOptions {
  /**
   * If true, numeric values are returned as Numeric objects to preserve full precision.
   * This allows continued precise calculations without IEEE-754 floating-point precision loss.
   * Default: false (returns native JavaScript numbers)
   */
  keepNumeric?: boolean,
}

/**
 *
 */
export class DetailedCellError {
  public readonly type: ErrorType
  public readonly message: string

  constructor(
    error: CellError,
    public readonly value: string,
    public readonly address?: string
  ) {
    this.type = error.type
    this.message = error.message ?? ''
  }

  /**
   *
   */
  public toString(): string {
    return this.value
  }

  /**
   *
   */
  public valueOf(): string {
    return this.value
  }
}
