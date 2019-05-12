export default class Coordinate {
  row: number
  column: number

  constructor(row: number, column: number) {
    this.row = row
    this.column = column
  }

  equals(other: Coordinate) {
    return this.row === other.row && this.column === other.column
  }
}
