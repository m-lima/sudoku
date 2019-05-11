import React from 'react'
import './css/Cell.css'

import Coordinate from '../model/Coordinate'

type IProps = {
  selected: boolean
  highlighted: boolean
  dark: boolean
  value?: number
  coordinate: Coordinate
  onClick: (coordinate: Coordinate) => void
}

const getBackground = (dark: boolean, selected: boolean, highlighted: boolean) => {
  return '#' + (dark ? 'ffffff' : '000000') + (selected ? '60' : (highlighted ? '30' : '00'))
}

const Cell: React.FC<IProps> = ({ selected, highlighted, dark, value, coordinate, onClick }) =>
    <div
        className='Cell'
        style={{ background: getBackground(dark ? dark : false, selected, highlighted) }}
        onClick={() => onClick(coordinate)}
    >
      {value}
    </div>

export default Cell
