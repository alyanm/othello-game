import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  providers: [GameService],
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  board: string[][] = [];
  currentPlayer: string = 'B';
  score: { B: number; W: number } = { B: 0, W: 0 };
  gameOver: boolean = false;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.resetGame();
  }

  resetGame() {
    this.board = this.gameService.initializeBoard();
    this.currentPlayer = 'B';
    this.updateScore();
    this.gameOver = false;
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
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
    if (!this.gameService.hasValidMoves(this.board, this.currentPlayer)) {
      console.log(`No valid moves for ${this.currentPlayer}. Switching back.`);
      this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
    }
  }

  updateScore() {
    this.score = this.gameService.getScore(this.board);
  }

  checkGameState() {
    if (this.gameService.isGameOver(this.board)) {
      this.gameOver = true;
      console.log('Game over!');
    }
  }
}
