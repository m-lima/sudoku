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
    let board = this.state.board
    for (let column = 0; column < 9; column++) {
      for (let row = 0; row < 9; row++) {
        if (Math.random() < 0.15) {
          board.setValue(new Coordinate(row, column), Math.floor(Math.random() * 9))
        }
      }
    }
    this.setState({board: board})
  }

  componentDidMount() {
    this.buildBoard()
    this.checkForErrors()
  }

  render() {
    return (
        <div className='Sudoku' style={{background: this.state.dark ? 'black' : 'white'}}>
          <Board
              {...this.state}
              onClick={(coordinate: Coordinate) => this.setState({selected: coordinate})}
          />
        </div>
    )
  }
}
