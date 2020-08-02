import React from 'react'
import './css/Sudoku.css'

import Board from './Board'
import ValueBar from './ValueBar'

import Coordinate from '../model/Coordinate'
import Difficulty from '../model/Difficulty'
import GameState, {Mode} from '../model/GameState'
import Matrix from '../model/Matrix';
import * as Helper from '../util/BoardHelper'

interface SudokuState extends GameState {
  initial: Date,
  elapsed: number,
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
        if (!Helper.isValid(this.state.board, index)) {
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
    Helper.shuffle(solution)

    let pruned = solution.clone()
    Helper.prune(pruned, difficulty)

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
          <span>
            <button onClick={() => {
              this.setState({dark: !this.state.dark})
            }}> {this.state.dark ? 'Light mode' : 'Dark mode'}
            </button>
            <button onClick={() => this.start(Difficulty.EASY)}> New easy</button>
            <button onClick={() => this.start(Difficulty.MEDIUM)}> New medium</button>
            <button onClick={() => this.start(Difficulty.HARD)}> New hard</button>
          </span>
        </div>
    )
  }
}
