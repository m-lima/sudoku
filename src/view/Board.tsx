import React from 'react'
import './css/Board.css'

import Coordinate from '../model/Coordinate'
import GameState from '../model/GameState'

interface Props extends GameState {
  onClick: (coordinate: Coordinate) => void
}

interface ClusterProps extends Props {
  index: Coordinate
}

type CellProps = {
  selected: boolean
  highlighted: boolean
  // status: CellStatus
  error: boolean
  dark: boolean
  value: number
  coordinate: Coordinate
  onClick: (coordinate: Coordinate) => void
}

const getCellBackground = (dark: boolean, selected: boolean, highlighted: boolean) => {
  return '#' + (dark ? 'ffffff' : '000000') + (selected ? '60' : (highlighted ? '30' : '00'))
}

const isErrorCell = (cell: Coordinate, errors: Coordinate[]) => {
  for (let i = 0; i < errors.length; i++) {
    if (errors[i].equals(cell)) {
      return true
    }
  }
  return false
}

const Cell = ({selected, highlighted, error, dark, value, coordinate, onClick}: CellProps) =>
    <div
        className='Board-cell'
        style={{
          background: getCellBackground(dark, selected, highlighted),
          color: error ? 'red' : (dark ? 'white' : 'black'),
        }}
        onClick={() => onClick(coordinate)}
    >
      {value > 0 && value}
    </div>

const Cluster = ({board, errors, selected, dark, onClick, index}: ClusterProps) =>
    <div className='Board-cluster' style={{borderColor: dark ? 'white' : 'black'}}>
      {Array.from(Array(9)).map((v, i) => {
        let cell = new Coordinate(index.row * 3 + Math.floor(i / 3), index.column * 3 + (i % 3))
        return <Cell
            key={i}
            selected={selected !== undefined && cell.equals(selected)}
            highlighted={selected !== undefined && (cell.row === selected.row || cell.column === selected.column)}
            error={isErrorCell(cell, errors)}
            dark={dark}
            value={board.getValue(cell)}
            coordinate={cell}
            onClick={onClick}
        />
      })}
    </div>

const Board: React.FC<Props> = (props) =>
    <div className='Board' style={{
      background: props.dark ? 'black' : 'white'
    }}>
      {Array.from(Array(9)).map((v, i) =>
          <Cluster key={i} {...props} index={new Coordinate(Math.floor(i / 3), i % 3)}/>
      )}
    </div>

export default Board
