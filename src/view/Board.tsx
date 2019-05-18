import React from 'react'
import './css/Board.css'

import Coordinate from '../model/Coordinate'
import GameState, {Mode} from '../model/GameState'

interface Props extends GameState {
  onClick: (coordinate: Coordinate) => void
}

interface ClusterProps extends Props {
  index: Coordinate
}

type CellProps = {
  dark: boolean
  selected: boolean
  highlighted: boolean
  error: boolean
  locked: boolean
  victory: boolean
  value: number
  coordinate: Coordinate
  onClick: (coordinate: Coordinate) => void
}

const isErrorCell = (cell: Coordinate, errors: Coordinate[]) => {
  for (let i = 0; i < errors.length; i++) {
    if (errors[i].equals(cell)) {
      return true
    }
  }
  return false
}

const buildCellClass = (dark: boolean, selected: boolean, highlighted: boolean, error: boolean, locked: boolean, victory: boolean) => {
  if (victory) {
    return 'Board-cell victory'
  }

  let className = 'Board-cell'
  className += dark ? ' dark' : ' light'
  if (locked) className += ' locked'
  if (selected) className += ' selected'
  if (highlighted) className += ' highlighted'
  if (error) className += ' error'
  return className
}

const Cell = ({dark, selected, highlighted, error, locked, victory, value, coordinate, onClick}: CellProps) =>
    <div
        className={buildCellClass(dark, selected, highlighted, error, locked, victory)}
        onClick={() => onClick(coordinate)}
    >
      {value > 0 && value}
    </div>

const Cluster = ({board, pruned, errors, selected, dark, mode, onClick, index}: ClusterProps) => {
  return <div className='Board-cluster'>
    {Array.from(Array(9)).map((v, i) => {
      let cell = new Coordinate(index.row * 3 + Math.floor(i / 3), index.column * 3 + (i % 3))
      return <Cell
          key={i}
          selected={selected !== undefined && (selected.equals(cell) || (board.getValue(selected) !== 0 && board.getValue(selected) === board.getValue(cell)))}
          highlighted={selected !== undefined && (cell.row === selected.row || cell.column === selected.column)}
          error={isErrorCell(cell, errors)}
          locked={pruned.getValue(cell) !== 0}
          victory={mode === Mode.VICTORY}
          dark={dark}
          value={board.getValue(cell)}
          coordinate={cell}
          onClick={onClick}
      />
    })}
  </div>
}

const Board: React.FC<Props> = (props) =>
    <div className='Board'>
      {Array.from(Array(9)).map((v, i) =>
          <Cluster key={i} {...props} index={new Coordinate(Math.floor(i / 3), i % 3)}/>
      )}
    </div>

export default Board
