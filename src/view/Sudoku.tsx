import React from 'react'
import './css/Sudoku.css'

import Board from './Board'
import Coordinate from '../model/Coordinate'
import GameState from '../model/GameState'
import Matrix from "../model/Matrix";

export default class Sudoku extends React.Component<{}, GameState> {

  state = {
    board: new Matrix(),
    notes: [[[]]],
    errors: [],
    selected: undefined,
    dark: false,
  }

  checkRow(index: Coordinate) {
    if (this.state.board.getValue(index) === 0) {
      return true
    }
    for (let i = new Coordinate(index.row, 0); i.column < 9; i.column++) {
      if (i.equals(index)) {
        continue
      }
      if (this.state.board.getValue(i) === this.state.board.getValue(index)) {
        return false
      }
    }
    return true
  }

  checkColumn(index: Coordinate) {
    if (this.state.board.getValue(index) === 0) {
      return true
    }
    for (let i = new Coordinate(0, index.column); i.row < 9; i.row++) {
      if (i.equals(index)) {
        continue
      }
      if (this.state.board.getValue(i) === this.state.board.getValue(index)) {
        return false
      }
    }
    return true
  }

  checkCluster(index: Coordinate) {
    if (this.state.board.getValue(index) === 0) {
      return true
    }
    for (let i = new Coordinate(Math.floor(index.row / 3) * 3, Math.floor(index.column / 3) * 3);
         i.row < (Math.floor(index.row / 3) + 1) * 3;
         i.row++) {
      for (i.column = Math.floor(index.column / 3) * 3; i.column < (Math.floor(index.column / 3) + 1) * 3; i.column++) {
        if (i.equals(index)) {
          continue
        }
        if (this.state.board.getValue(i) === this.state.board.getValue(index)) {
          return false
        }
      }
    }
    return true
  }

  checkForErrors() {
    let errors: Coordinate[] = []

    for (let column = 0; column < 9; column++) {
      for (let row = 0; row < 9; row++) {
        let index = new Coordinate(row, column)
        if (this.state.board.getValue(index) === 0) {
          continue
        }
        if (!this.checkRow(index)) {
          errors.push(index)
          continue
        }
        if (!this.checkColumn(index)) {
          errors.push(index)
          continue
        }
        if (!this.checkCluster(index)) {
          errors.push(index)
          continue
        }
      }
    }

    this.setState({errors: errors})
  }

  buildBoard() {
    let board = new Matrix()

    for (let i = 0; i < 1000; i++) {
      switch (Math.floor(Math.random() * 7)) {
        case 0:
          board.rotate()
          break
        case 1:
          board.mirrowRows()
          break
        case 2:
          board.mirrorColumns()
          break
        case 3:
          board.swapRows(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3))
          break
        case 4:
          board.swapColumns(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3))
          break
        case 5:
          board.swapRowClusters(Math.floor(Math.random() * 3))
          break
        case 6:
          board.swapColumnClusters(Math.floor(Math.random() * 3))
          break
      }
    }

    this.setState({board: board})
  }

  prune() {
    let board = new Matrix()

    for (let i = 9 * 9 - 25; i >= 0; i--) {
      let cell = new Coordinate(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9))
      while (board.getValue(cell) === 0) {
        cell = new Coordinate(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9))
      }
      board.setValue(cell, 0)
    }

    this.setState({board: board})
  }

  componentDidMount() {
    this.buildBoard()
    this.prune()
  }

  render() {
    return (
        <div className={'Sudoku ' + (this.state.dark ? 'dark' : 'light')}>
          <Board
              {...this.state}
              onClick={(coordinate: Coordinate) => this.setState({selected: coordinate})}
          />
          <button
              onClick={() => {
                this.buildBoard()
              }}
          >
            Generate
          </button>
          <button
              onClick={() => {
                this.setState({dark: !this.state.dark})
              }}
          >
            {this.state.dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button
              onClick={() => {
                this.prune()
              }}
          >
            Prune
          </button>
        </div>
    )
  }
}
