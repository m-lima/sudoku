import React from 'react'
import './css/Board.css'

import Cell from './Cell'
import Coordinate from '../model/Coordinate'

interface Props {
  board: number[][]
  selected: Coordinate
  dark: boolean
  onClick: (coordinate: Coordinate) => void
}

interface ClusterProps extends Props {
  index: Coordinate
}

const Cluster = ({ board, selected, dark, onClick, index }: ClusterProps) =>
    <div className='Board-cluster'>
      {Array.from(Array(9)).map((v, i) =>
          <Cell
              key={i}
              value={board[index.row * 3 + (i % 3)][index.column * 3 + Math.floor(i / 3)]}
              selected={(selected.row === index.row * 3 + (i % 3)) && (selected.column === index.column * 3 + Math.floor(i / 3))}
              highlighted={(selected.row === index.row * 3 + (i % 3)) || (selected.column === index.column * 3 + Math.floor(i / 3))}
              coordinate={{row: index.row * 3 + (i % 3), column: index.column * 3 + Math.floor(i / 3)}}
              onClick={onClick}
              dark={dark}
          />
      )}
    </div>

const Board: React.FC<Props> = ({ board, selected, dark, onClick }) =>
    <div className='Board' style={{
      background: dark ? 'black' : 'white'
    }}>
      {Array.from(Array(9)).map((v, i) =>
          <Cluster
              key={i}
              board={board}
              selected={selected}
              dark={dark}
              onClick={onClick}
              index={{row: i % 3, column: Math.floor(i / 3)}}
          />
      )}
    </div>

export default Board
