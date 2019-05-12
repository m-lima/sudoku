import React from 'react'
import './css/ValueBar.css'

type ValueBarProps = {
  onClick: (value: number) => void
}

const ValueBar: React.FC<ValueBarProps> = ({ onClick }: ValueBarProps) =>
    <div className='ValueBar'>
      <span className='ValueBar-button' onClick={() => onClick(0)}></span>
      <span className='ValueBar-button' onClick={() => onClick(1)}>1</span>
      <span className='ValueBar-button' onClick={() => onClick(2)}>2</span>
      <span className='ValueBar-button' onClick={() => onClick(3)}>3</span>
      <span className='ValueBar-button' onClick={() => onClick(4)}>4</span>
      <span className='ValueBar-button' onClick={() => onClick(5)}>5</span>
      <span className='ValueBar-button' onClick={() => onClick(6)}>6</span>
      <span className='ValueBar-button' onClick={() => onClick(7)}>7</span>
      <span className='ValueBar-button' onClick={() => onClick(8)}>8</span>
      <span className='ValueBar-button' onClick={() => onClick(9)}>9</span>
    </div>

export default ValueBar