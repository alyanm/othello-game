import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  initializeBoard(): string[][] {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(''));
    board[3][3] = board[4][4] = 'W';
    board[3][4] = board[4][3] = 'B';
    return board;
  }

  isValidMove(
    board: string[][],
    row: number,
    col: number,
    player: string
  ): boolean {
    if (board[row][col] !== '') return false;

    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let foundOpponent = false;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] === '') break;
        if (board[x][y] === player) {
          if (foundOpponent) return true;
          break;
        }
        foundOpponent = true;
        x += dx;
        y += dy;
      }
    }

    return false;
  }

  makeMove(
    board: string[][],
    row: number,
    col: number,
    player: string
  ): string[][] {
    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = player;

    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      const toFlip = [];

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (newBoard[x][y] === '') break;
        if (newBoard[x][y] === player) {
          for (const [fx, fy] of toFlip) {
            newBoard[fx][fy] = player;
          }
          break;
        }
        toFlip.push([x, y]);
        x += dx;
        y += dy;
      }
    }

    return newBoard;
  }

  getScore(board: string[][]): { B: number; W: number } {
    const score = { B: 0, W: 0 };
    for (const row of board) {
      for (const cell of row) {
        if (cell === 'B') score.B++;
        if (cell === 'W') score.W++;
      }
    }
    return score;
  }

  hasValidMoves(board: string[][], player: string): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.isValidMove(board, row, col, player)) {
          return true;
        }
      }
    }
    return false;
  }

  isGameOver(board: string[][]): boolean {
    return !this.hasValidMoves(board, 'B') && !this.hasValidMoves(board, 'W');
  }

  getAIMove(board: string[][]): [number, number] | null {
    let bestMove: [number, number] | null = null;
    let minOpponentMoves = Infinity;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.isValidMove(board, row, col, 'B')) {
          const newBoard = this.makeMove(board, row, col, 'B');
          const opponentMoves = this.countValidMoves(newBoard, 'W');

          if (opponentMoves < minOpponentMoves) {
            minOpponentMoves = opponentMoves;
            bestMove = [row, col];
          } else if (opponentMoves === minOpponentMoves) {
            // If moves are equal, prefer corners and edges
            if (
              this.isCornerOrEdge(row, col) &&
              !this.isCornerOrEdge(bestMove![0], bestMove![1])
            ) {
              bestMove = [row, col];
            }
          }
        }
      }
    }

    return bestMove;
  }

  private countValidMoves(board: string[][], player: string): number {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.isValidMove(board, row, col, player)) {
          count++;
        }
      }
    }
    return count;
  }

  // Helper method to check if a position is a corner or edge
  private isCornerOrEdge(row: number, col: number): boolean {
    return row === 0 || row === 7 || col === 0 || col === 7;
  }

  // Add a method to evaluate the board state (useful for more advanced AI)
  evaluateBoard(board: string[][], player: string): number {
    const opponent = player === 'B' ? 'W' : 'B';
    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === player) {
          score += this.getPositionValue(row, col);
        } else if (board[row][col] === opponent) {
          score -= this.getPositionValue(row, col);
        }
      }
    }

    return score;
  }

  // Helper method to get the value of a position on the board
  private getPositionValue(row: number, col: number): number {
    const valueMap = [
      [100, -10, 11, 6, 6, 11, -10, 100],
      [-10, -20, 1, 2, 2, 1, -20, -10],
      [11, 1, 3, 4, 4, 3, 1, 11],
      [6, 2, 4, 3, 3, 4, 2, 6],
      [6, 2, 4, 3, 3, 4, 2, 6],
      [11, 1, 3, 4, 4, 3, 1, 11],
      [-10, -20, 1, 2, 2, 1, -20, -10],
      [100, -10, 11, 6, 6, 11, -10, 100]
    ];
    return valueMap[row][col];
  }
}
