import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HistoryItem } from 'src/app/models/history-item';
import { OaiRequest } from 'src/app/models/oai-request';
import { OaiResponse } from 'src/app/models/oai-response';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input() id: string = '';
  @Input() question: string = '';
  @Input() answer: string = '';
  @Input() loading: boolean = false;
  @Input() history: HistoryItem[] = [];

  type: string = '';
  types: string[] = ['gen', 'sec', 'k8s'];

  @Output() sendQuestion: EventEmitter<OaiRequest> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  // ngOnChanges(): void {
  //   console.log(this.answer);
  //   let m = this.messages.find(m => m.id === this.id);
  //   if(!m) {
  //     this.messages.push({ id: this.id, question: this.question, answer: this.answer });
  //   }
  // }

  ask(): void {
    let req = { type: this.type, question: this.question } as OaiRequest;
    this.sendQuestion.emit(req);
  }

}
