import React from 'react'
import './css/Sudoku.css'

import Board from './Board'
import ValueBar from './ValueBar'

import Coordinate from '../model/Coordinate'
import GameState from '../model/GameState'
import Matrix from '../model/Matrix';

interface SudokuState extends GameState {
  playing: boolean,
  initial: Date,
  elapsed: number;
}

export default class Sudoku extends React.Component<{}, SudokuState> {

  state = {
    board: new Matrix(),
    notes: [[[]]],
    errors: [],
    selected: undefined,
    dark: false,
    playing: false,
    initial: new Date(),
    elapsed: 0,
  }

  constructor(props: {}) {
    super(props)
    this.tick = this.tick.bind(this)
  }

  tick() {
    if (this.state.playing) {
      this.setState({elapsed: (new Date().valueOf() - this.state.initial.valueOf()) / 1000})
    }
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

  generate() {
    this.state.board.initialize()
    this.setState({board: this.state.board})
  }

  shuffle() {
    let board = this.state.board

    for (let i = 0; i < 100000; i++) {
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

  prune(hints: number) {
    let board = this.state.board

    for (let i = 9 * 9 - hints; i >= 0; i--) {
      let cell = new Coordinate(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9))
      while (board.getValue(cell) === 0) {
        cell = new Coordinate(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9))
      }
      board.setValue(cell, 0)
    }

    this.setState({board: board})
  }

  start(hints: number) {
    this.generate()
    this.shuffle()
    this.prune(hints)
    this.setState({initial: new Date(), playing: true})

    if (!this.state.playing) {
      setInterval(this.tick, 1000)
    }
  }

  registerChange() {
    this.setState({board: this.state.board})
    this.checkForErrors()
  }

  render() {
    let minutesNumber = Math.floor(this.state.elapsed / 60)
    let secondsNumber = Math.floor(this.state.elapsed % 60)

    let seconds = secondsNumber < 10 ? '0' + secondsNumber : secondsNumber
    let minutes = minutesNumber < 10 ? '0' + minutesNumber : minutesNumber

    return (
        <div className={'Sudoku ' + (this.state.dark ? 'dark' : 'light')}>

          {minutes}:{seconds}

          <Board
              {...this.state}
              onClick={(coordinate: Coordinate) => this.setState({selected: coordinate})}
          />
          <ValueBar onClick={(value: number) => {
            if (this.state.selected) {
              this.state.board.setValue(this.state.selected as unknown as Coordinate, value)
              this.registerChange()
            }
          }}/>
          <button onClick={() => {
            this.setState({dark: !this.state.dark})
          }}> {this.state.dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button onClick={() => this.start(65)}> New easy</button>
          <button onClick={() => this.start(45)}> New medium</button>
          <button onClick={() => this.start(25)}> New hard</button>
        </div>
    )
  }
}
