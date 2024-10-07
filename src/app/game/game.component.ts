import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game',
  standalone: true,
  providers: [GameService],
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  board: string[][] = [];
  currentPlayer: string = 'B';
  userPlayer: string = 'W';
  AIPlayer: string = 'B';
  isBlack: boolean = true;
  score: { B: number; W: number } = { B: 0, W: 0 };
  gameOver: boolean = false;
  message: string = '';

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.resetGame();
  }

  resetGame() {
    this.board = this.gameService.initializeBoard();
    this.currentPlayer = 'B';
    this.updateScore();
    this.gameOver = false;
    this.message = '';
    this.AIPlayer = this.isBlack ? 'W' : 'B';
    if (!this.isBlack) {
      this.makeAIMove();
    }
  }

  makeMove(row: number, col: number) {
    if (this.gameOver) return;

    if (
      this.gameService.isValidMove(this.board, row, col, this.currentPlayer)
    ) {
      this.board = this.gameService.makeMove(
        this.board,
        row,
        col,
        this.currentPlayer
      );
      this.switchPlayer();
      this.updateScore();
      this.checkGameState();

      if (!this.gameOver) {
        setTimeout(() => this.makeAIMove(), 500); // Delay AI move for better UX
      }
    }
  }

  makeAIMove() {
    if (this.gameOver || this.currentPlayer === this.userPlayer) return;

    const aiMove = this.gameService.getAIMove(this.board, this.AIPlayer);
    if (aiMove) {
      console.log('AI Move:', aiMove);
      const [row, col] = aiMove;
      this.board = this.gameService.makeMove(
        this.board,
        row,
        col,
        this.AIPlayer
      );
      this.switchPlayer();
      this.updateScore();
      this.checkGameState();
    } else {
      this.switchPlayer();
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
    if (!this.gameService.hasValidMoves(this.board, this.currentPlayer)) {
      this.message = `No valid moves for ${
        this.currentPlayer === 'B' ? 'Black' : 'White'
      }. Switching back.`;
      this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
    } else {
      this.message = '';
    }
  }

  updateScore() {
    this.score = this.gameService.getScore(this.board);
  }

  checkGameState() {
    if (this.gameService.isGameOver(this.board)) {
      this.gameOver = true;
      this.message = 'Game Over!';
      if (this.score.B > this.score.W) {
        if (this.score.B > this.score.W) {
          this.message += ' Black wins!';
        } else if (this.score.B < this.score.W) {
          this.message += ' White wins!';
        } else {
          this.message += " It's a tie!";
        }
      }
    }
  }
}
