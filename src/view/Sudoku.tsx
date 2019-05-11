import React from 'react'
import './css/Sudoku.css'

import Board from './Board'
import Coordinate from '../model/Coordinate'

type State = {
  board: number[][]
  notes: number[][][]
  selected: Coordinate
  dark: boolean
}

export default class Sudoku extends React.Component<{}, State> {

  state = {
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 0],
      [3, 3, 3, 3, 3, 3, 3, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    notes: [[[]]],
    selected: {
      row: 0,
      column: 0,
    },
    dark: false,
  }

  render() {
    return (
        <div className='Sudoku'>
          <Board
              board={this.state.board}
              selected={this.state.selected}
              dark={this.state.dark}
              onClick={(coordinate: Coordinate) => this.setState({ selected: coordinate })}
          />
        </div>
    )
  }
}
