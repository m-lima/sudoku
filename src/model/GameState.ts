import Matrix from './Matrix'
import Coordinate from './Coordinate'

export enum Mode {
  NEW,
  PLAYING,
  VICTORY
}

export default interface GameState {
  board: Matrix
  pruned: Matrix
  solution: Matrix
  notes: number[][][]
  errors: Coordinate[]
  selected?: Coordinate
  dark: boolean
  mode: Mode
}
