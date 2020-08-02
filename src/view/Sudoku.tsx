import React from 'react'
import './css/Sudoku.css'

import Board from './Board'
import ValueBar from './ValueBar'

import Coordinate from '../model/Coordinate'
import Difficulty from '../model/Difficulty'
import GameState, {Mode} from '../model/GameState'
import Matrix from '../model/Matrix';

interface SudokuState extends GameState {
  initial: Date,
  elapsed: number;
}

const prune = (matrix: Matrix, difficulty: Difficulty) => {

  // Generate a random sequence of cells
  let cells = randomCellSequence()

  // How many to remove
  let end = difficultyToSize(difficulty)

  let removed = removeObvious(matrix, cells)

  for (let i = 0; i < 81 && removed < end; i++) {
    let cell = new Coordinate(cells[i] % 9, Math.floor(cells[i] / 9))

    // Was already obviously removed
    if (matrix.getValue(cell) === 0) {
      continue
    }

    // Clear the cell and save the preivous value
    let previous = matrix.getValue(cell)
    matrix.setValue(cell, 0)

    // Does this break the game?
    // If so, undo and pretend nothing happened
    if (i > 0 && multipleSolutions(matrix, cell, previous)) {
      matrix.setValue(cell, previous)
    } else {
      removed++
    }
  }
  console.log(`Removed ${removed} cells`)
}

const randomCellSequence = () => {
  let cells = Array.from(Array(81).keys())

  for (let i = 80; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1))
    const t = cells[j]
    cells[j] = cells[i]
    cells[i] = t
  }

  return cells
}

const difficultyToSize = (difficulty: Difficulty) => {
  if (difficulty === Difficulty.EASY) {
    return 41
  }

  if (difficulty === Difficulty.MEDIUM) {
    return 61
  }

  return 81
}

const removeObvious = (matrix: Matrix, cells: number[]) => {
  let removed = 0

  for (let i = 0; i < 81; i++) {
    let cell = new Coordinate(cells[i] % 9, Math.floor(cells[i] / 9))

    // Save the preivous value
    let previous = matrix.getValue(cell)

    let stillValid = false
    for (let value = 1; value < 10; value++) {
      if (value === previous) {
        continue
      }

      matrix.setValue(cell, value)
      if (checkRow(matrix, cell) && checkColumn(matrix, cell) && checkCluster(matrix, cell)) {
        stillValid = true
        break
      }
    }

    if (stillValid) {
      matrix.setValue(cell, previous)
    } else {
      matrix.setValue(cell, 0)
      removed++
    }
  }

  return removed
}

const multipleSolutions = (matrix: Matrix, cell: Coordinate, value: number) => {
  for (let i = 1; i < 10; i++) {
    // Skip the number that we just removed
    if (i === value) {
      continue
    }

    let newMatrix = matrix.clone()
    newMatrix.setValue(cell, i)

    if (solvable(newMatrix)) {
      return true
    }
  }

  // So far we have only one solution
  return false
}

const solvable = (matrix: Matrix) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let cell = new Coordinate(i, j)

      // Skip non-empty cell
      if (matrix.getValue(cell) !== 0) {
        continue
      }

      for (let value = 1; value < 10; value++) {
        matrix.setValue(cell, value)
        if (checkRow(matrix, cell) && checkColumn(matrix, cell) && checkCluster(matrix, cell)) {
          if (solvable(matrix.clone())) {
            return true
          }
        }
      }

      matrix.setValue(cell, 0)
    }
  }

  return false
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

const shuffle = (matrix: Matrix) => {
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

  start(difficulty: Difficulty) {
    let solution = new Matrix()
    solution.initialize()
    shuffle(solution)

    let pruned = solution.clone()
    prune(pruned, difficulty)

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
          <button onClick={() => this.start(Difficulty.EASY)}> New easy</button>
          <button onClick={() => this.start(Difficulty.MEDIUM)}> New medium</button>
          <button onClick={() => this.start(Difficulty.HARD)}> New hard</button>
        </div>
    )
  }
}
