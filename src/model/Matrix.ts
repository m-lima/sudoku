import Coordinate from './Coordinate'

export default class Matrix {
  private board: number[]

  constructor() {
    this.board = [
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]
  }

  initialize() {
    this.board = [
      1, 2, 3, 4, 5, 6, 7, 8, 9,
      4, 5, 6, 7, 8, 9, 1, 2, 3,
      7, 8, 9, 1, 2, 3, 4, 5, 6,
      2, 3, 4, 5, 6, 7, 8, 9, 1,
      5, 6, 7, 8, 9, 1, 2, 3, 4,
      8, 9, 1, 2, 3, 4, 5, 6, 7,
      3, 4, 5, 6, 7, 8, 9, 1, 2,
      6, 7, 8, 9, 1, 2, 3, 4, 5,
      9, 1, 2, 3, 4, 5, 6, 7, 8,
    ]
  }

  getRow(index: number): number[] {
    return Array.from(Array(9), (v, i) => this.board[index * 9 + i])
  }

  setRow(index: number, row: number[]) {
    row.forEach((v, i) => this.board[index * 9 + i] = v)
  }

  getColumn(index: number): number[] {
    return Array.from(Array(9), (v, i) => this.board[i * 9 + index])
  }

  setColumn(index: number, column: number[]) {
    column.forEach((v, i) => this.board[i * 9 + index] = v)
  }

  getCluster(index: number): number[] {
    return Array.from(Array(9), (v, i) => this.board[i % 3 + Math.floor(i / 3) * 9 + (index % 3) * 3 + Math.floor(index / 3) * 27])
  }

  setCluster(index: number, cluster: number[]) {
    cluster.forEach((v, i) => this.board[i % 3 + Math.floor(i / 3) * 9 + (index % 3) * 3 + Math.floor(index / 3) * 27] = v)
  }

  getValue(index: Coordinate) {
    return this.board[index.row * 9 + index.column]
  }

  setValue(index: Coordinate, value: number) {
    this.board[index.row * 9 + index.column] = value
  }

  reverse() {
    this.board = this.board.reverse()
  }

  rotate() {
    this.board = Array.from(Array(9), (v, i) => this.getColumn(8 - i)).flat()
  }

  mirrowRows() {
    this.reverse()
    this.board = Array.from(Array(9), (v, i) => this.getRow(8 - i)).flat()
  }

  mirrorColumns() {
    this.board = Array.from(Array(9), (v, i) => this.getRow(8 - i)).flat()
  }

  swapRows(cluster: number, pivot: number) {
    this.swapRowsByIndex(((pivot + 1) % 3) + cluster * 3, ((pivot + 2) % 3) + cluster * 3)
  }

  swapColumns(cluster: number, pivot: number) {
    this.swapColumnsByIndex(((pivot + 1) % 3) + cluster * 3, ((pivot + 2) % 3) + cluster * 3)
  }

  swapRowClusters(pivot: number) {
    let i1 = ((pivot + 1) % 3) * 3
    let i2 = ((pivot + 2) % 3) * 3

    this.swapRowsByIndex(i1, i2)
    this.swapRowsByIndex(i1 + 1, i2 + 1)
    this.swapRowsByIndex(i1 + 2, i2 + 2)
  }

  swapColumnClusters(pivot: number) {
    let i1 = ((pivot + 1) % 3) * 3
    let i2 = ((pivot + 2) % 3) * 3

    this.swapColumnsByIndex(i1, i2)
    this.swapColumnsByIndex(i1 + 1, i2 + 1)
    this.swapColumnsByIndex(i1 + 2, i2 + 2)
  }

  private swapRowsByIndex(index1: number, index2: number) {
    let temp = this.getRow(index1)
    this.setRow(index1, this.getRow(index2))
    this.setRow(index2, temp)
  }

  private swapColumnsByIndex(index1: number, index2: number) {
    let temp = this.getColumn(index1)
    this.setColumn(index1, this.getColumn(index2))
    this.setColumn(index2, temp)
  }
}