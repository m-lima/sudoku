import React from 'react'
import './css/Sudoku.css'

import Board from './Board'
import ValueBar from './ValueBar'

import Coordinate from '../model/Coordinate'
import GameState, {Mode} from '../model/GameState'
import Matrix from '../model/Matrix';

interface SudokuState extends GameState {
  initial: Date,
  elapsed: number;
}

const prune = (matrix: Matrix, hints: number) => {
  let blacklist: Coordinate[] = []
  for (let i = 9 * 9 - hints; i >= 0; i--) {
    while(true) {

      let cell: Coordinate
      do {
        cell = new Coordinate(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9))
      } while (blacklist.includes(cell) || matrix.getValue(cell) === 0)

      let previous = matrix.getValue(cell)
      matrix.setValue(cell, 0)

      if (multipleSolutions(matrix, cell, previous)) {
        matrix.setValue(cell, previous)
        blacklist.push(cell)
      } else {
        break
      }
    }
  }
}

const multipleSolutions = (matrix: Matrix, cell: Coordinate, value: number) => {
  for (let i = 0; i < 9 * 9; i++) {
    // Skip the number that we just removed
    if (i === value) {
      continue
    }

    let newMatrix = matrix.clone()
    newMatrix.setValue(cell, i)

    // Check if we have multiple solutions
    if (solvable(newMatrix)) {
      return true
    }
  }

  // So far we have only one solution
  return false
}

const solvable = (matrix: Matrix) => {
  let solutionFound = false
  for (let i = 0; i < 9 * 9; i++) {
    for (let j = 0; j < 9; j++) {
      let cell = new Coordinate(i % 9, Math.floor(i / 9))
      if (matrix.getValue(cell) !== 0) {
        continue
      }

      matrix.setValue(cell, j)
      if (checkRow(matrix, cell) && checkColumn(matrix, cell) && checkCluster(matrix, cell)) {
        matrix.setValue(cell, 0)
        if (solutionFound) {
          return false
        } else {
          solutionFound = true
        }
      }
    }
  }

  return solutionFound
}

const checkRow = (matrix: Matrix, index: Coordinate) => {
  if (matrix.getValue(index) === 0) {
    return true
  }
  for (let i = new Coordinate(index.row, 0); i.column < 9; i.column++) {
    if (i.equals(index)) {
      continue
    }
    if (matrix.getValue(i) === matrix.getValue(index)) {
      return false
    }
  }
  return true
}

const checkColumn = (matrix: Matrix, index: Coordinate) => {
  if (matrix.getValue(index) === 0) {
    return true
  }
  for (let i = new Coordinate(0, index.column); i.row < 9; i.row++) {
    if (i.equals(index)) {
      continue
    }
    if (matrix.getValue(i) === matrix.getValue(index)) {
      return false
    }
  }
  return true
}

const checkCluster = (matrix: Matrix, index: Coordinate) => {
  if (matrix.getValue(index) === 0) {
    return true
  }
  for (let i = new Coordinate(Math.floor(index.row / 3) * 3, Math.floor(index.column / 3) * 3);
       i.row < (Math.floor(index.row / 3) + 1) * 3;
       i.row++) {
         for (i.column = Math.floor(index.column / 3) * 3; i.column < (Math.floor(index.column / 3) + 1) * 3; i.column++) {
           if (i.equals(index)) {
             continue
           }
           if (matrix.getValue(i) === matrix.getValue(index)) {
             return false
           }
         }
       }
       return true
}

export default class Sudoku extends React.Component<{}, SudokuState> {

  state = {
    board: new Matrix(),
    pruned: new Matrix(),
    solution: new Matrix(),
    notes: [[[]]],
    errors: [],
    selected: undefined,
    dark: false,
    mode: Mode.NEW,
    initial: new Date(),
    elapsed: 0,
  }

  constructor(props: {}) {
    super(props)
    this.tick = this.tick.bind(this)
  }

  tick() {
    if (this.state.mode === Mode.PLAYING) {
      this.setState({elapsed: (new Date().valueOf() - this.state.initial.valueOf()) / 1000})
    }
  }

  checkForErrors() {
    let errors: Coordinate[] = []

    for (let column = 0; column < 9; column++) {
      for (let row = 0; row < 9; row++) {
        let index = new Coordinate(row, column)
        if (this.state.board.getValue(index) === 0) {
          continue
        }
        if (!checkRow(this.state.board, index)) {
          errors.push(index)
          continue
        }
        if (!checkColumn(this.state.board, index)) {
          errors.push(index)
          continue
        }
        if (!checkCluster(this.state.board, index)) {
          errors.push(index)
          continue
        }
      }
    }

    this.setState({errors: errors})
  }

  start(hints: number) {
    let solution = new Matrix()
    solution.initialize()
    this.shuffle(solution)

    let pruned = solution.clone()
    prune(pruned, hints)

    let board = pruned.clone()

    if (this.state.mode === Mode.NEW) {
      setInterval(this.tick, 1000)
    }

    this.setState({
      board: board,
      pruned: pruned,
      solution: solution,
      mode: Mode.PLAYING,
      initial: new Date(),
    })
  }

  shuffle(matrix: Matrix) {
    for (let i = 0; i < 100; i++) {
      switch (Math.floor(Math.random() * 7)) {
        case 0:
          matrix.rotate()
          break
        case 1:
          matrix.mirrowRows()
          break
        case 2:
          matrix.mirrorColumns()
          break
        case 3:
          matrix.swapRows(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3))
          break
        case 4:
          matrix.swapColumns(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3))
          break
        case 5:
          matrix.swapRowClusters(Math.floor(Math.random() * 3))
          break
        case 6:
          matrix.swapColumnClusters(Math.floor(Math.random() * 3))
          break
      }
    }
  }

  checkVictory(): boolean {
    return this.state.board.equals(this.state.solution)
  }

  registerChange() {
    this.setState({board: this.state.board})
    this.checkForErrors()

    if (this.checkVictory()) {
      this.setState({mode: Mode.VICTORY})
    }
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
            if (this.state.selected && this.state.pruned.getValue(this.state.selected as unknown as Coordinate) === 0) {
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
