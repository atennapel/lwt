import { State } from "./state/State";
import * as Tone from "tone";

export class Display {
  private state: State;
  private container: HTMLDivElement;
  private buttons: HTMLDivElement[][] = [];

  constructor(state: State, container: HTMLDivElement) {
    this.state = state;
    this.container = container;
  }

  initialize(onClick: (x: number, y: number) => void): void {
    for (let c of this.container.children) this.container.removeChild(c);
    this.buttons = [];
    for (let row = 0; row < 2; row++) {
      const currentRow: HTMLDivElement[] = [];
      this.buttons.push(currentRow);
      for (let column = 0; column < 8; column++) {
        const button = document.createElement("div");
        button.classList.add("tile");
        button.textContent = (column + row * 8).toString(16).toUpperCase();
        const noteLabel = document.createElement("div");
        noteLabel.classList.add("note-label");
        button.appendChild(noteLabel);
        if (row < 2 && column < 8) button.style.backgroundColor = "white";
        button.addEventListener("click", () => onClick(column, row));
        this.container.appendChild(button);
        currentRow.push(button);
      }
    }
  }

  private getButton(x: number, y: number): HTMLDivElement {
    return this.buttons[y][x];
  }

  refresh() {
    for (let row = 0; row < 2; row++) {
      for (let column = 0; column < 8; column++) {
        const index = column + row * 8;
        const tick = this.state.getTick();
        const note = this.state.get(index);
        const button = this.getButton(column, row)
        button.childNodes[1].textContent = note >= 0 ? Tone.Frequency(note, "midi").toNote().toString() : "";
        if (this.state.isPlaying() && tick == index)
          button.style.backgroundColor = note >= 0 ? "brown" : "red";
        else
          button.style.backgroundColor = note >= 0 ? "green" : "white";
      }
    }
  }
}