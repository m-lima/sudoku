import Matrix from './Matrix'
import Coordinate from './Coordinate'

export default interface GameState {
  board: Matrix
  notes: number[][][]
  errors: Coordinate[]
  selected?: Coordinate
  dark: boolean
}