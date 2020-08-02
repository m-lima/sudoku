import Coordinate from '../model/Coordinate'
import Difficulty from '../model/Difficulty'
import Matrix from '../model/Matrix';

export const isValid = (matrix: Matrix, cell: Coordinate) => {
  return checkRow(matrix, cell) && checkColumn(matrix, cell) && checkCluster(matrix, cell)
}

export const shuffle = (matrix: Matrix) => {
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

export const prune = (matrix: Matrix, difficulty: Difficulty) => {

  // Generate a random sequence of cells
  let cells = randomCellSequence()

  // How many to remove
  let end = difficultyToSize(difficulty)

  // How many were removed effectively
  let removed = removeObvious(matrix, cells)

  let knownValid = [ matrix.clone() ]

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
    if (multipleSolutions(matrix, cell, previous, knownValid)) {
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
      if (isValid(matrix, cell)) {
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

const addObvious = (matrix: Matrix) => {
  let added = false
  for (let i = 0; i < 81; i++) {
    let cell = new Coordinate(i % 9, Math.floor(i / 9))

    if (matrix.getValue(cell) !== 0) {
      continue
    }

    let obviousOption = 0
    for (let value = 1; value < 10; value++) {
      matrix.setValue(cell, value)
      if (isValid(matrix, cell)) {
        if (obviousOption === 0) {
          // Mark this as a candidate for adding
          obviousOption = value
        } else {
          // This is a second candidate!
          // Clear the previous candidate and break away
          obviousOption = 0
          break
        }
      }
    }

    matrix.setValue(cell, obviousOption)

    if (obviousOption !== 0) {
      added = true
    }
  }

  if (added) {
    addObvious(matrix)
  }
}

const multipleSolutions = (matrix: Matrix, cell: Coordinate, value: number, knownValid: Matrix[]) => {
  for (let i = 1; i < 10; i++) {
    // Skip the number that we just removed
    if (i === value) {
      continue
    }

    let newMatrix = matrix.clone()
    newMatrix.setValue(cell, i)

    addObvious(newMatrix)
    if (solvable(newMatrix, knownValid)) {
      console.log('Adding known solvable state')
      knownValid.push(matrix)
      return true
    }
  }

  // So far we have only one solution
  return false
}

const solvable = (matrix: Matrix, knownValid: Matrix[]) => {
  if (isKnownValid(matrix, knownValid)) {
    console.log('I reached a state known to be solvable')
    return true
  }

  for (let row = 0; row < 9; row++) {
    for (let column = 0; column < 9; column++) {
      let cell = new Coordinate(row, column)

      // Skip non-empty cell
      if (matrix.getValue(cell) !== 0) {
        continue
      }

      for (let value = 1; value < 10; value++) {
        matrix.setValue(cell, value)
        if (isValid(matrix, cell)) {
          if (solvable(matrix, knownValid)) {
            return true
          }
        }
      }

      matrix.setValue(cell, 0)
    }
  }

  return false
}

const isKnownValid = (matrix: Matrix, knownValid: Matrix[]) => {
  return knownValid.find(current => current.equals(matrix)) !== undefined
}

const checkRow = (matrix: Matrix, cell: Coordinate) => {
  if (matrix.getValue(cell) === 0) {
    return true
  }
  for (let i = new Coordinate(cell.row, 0); i.column < 9; i.column++) {
    if (i.equals(cell)) {
      continue
    }
    if (matrix.getValue(i) === matrix.getValue(cell)) {
      return false
    }
  }
  return true
}

const checkColumn = (matrix: Matrix, cell: Coordinate) => {
  if (matrix.getValue(cell) === 0) {
    return true
  }
  for (let i = new Coordinate(0, cell.column); i.row < 9; i.row++) {
    if (i.equals(cell)) {
      continue
    }
    if (matrix.getValue(i) === matrix.getValue(cell)) {
      return false
    }
  }
  return true
}

const checkCluster = (matrix: Matrix, cell: Coordinate) => {
  if (matrix.getValue(cell) === 0) {
    return true
  }
  for (let i = new Coordinate(Math.floor(cell.row / 3) * 3, Math.floor(cell.column / 3) * 3);
       i.row < (Math.floor(cell.row / 3) + 1) * 3;
       i.row++) {
         for (i.column = Math.floor(cell.column / 3) * 3; i.column < (Math.floor(cell.column / 3) + 1) * 3; i.column++) {
           if (i.equals(cell)) {
             continue
           }
           if (matrix.getValue(i) === matrix.getValue(cell)) {
             return false
           }
         }
       }
       return true
}
