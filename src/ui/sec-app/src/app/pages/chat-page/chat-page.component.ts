import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { error } from 'console';
import { BehaviorSubject, EMPTY, Observable, Subject, debounceTime, distinctUntilChanged, share, switchMap } from 'rxjs';
import { EMPTY_OBSERVER } from 'rxjs/internal/Subscriber';
import { HistoryItem } from 'src/app/models/history-item';
import { OaiMessage } from 'src/app/models/oai-message';
import { OaiRequest } from 'src/app/models/oai-request';
import { OaiResponse } from 'src/app/models/oai-response';
import { OaiService } from 'src/app/services/oai-service.service';

declare var window: any;

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatPageComponent implements OnInit {

  id: string = '';
  answer: string = '';
  loading: boolean = false;
  history: HistoryItem[] = [];

  @ViewChild('panel') panel!: ElementRef<HTMLDivElement>;
  @ViewChild('tool') tool!: ElementRef<HTMLDivElement>;
  @ViewChild('command') command!: ElementRef<HTMLDivElement>;
  @ViewChild('code') code!: ElementRef<HTMLDivElement>;
  targetName: string = '';

  // response$!: Observable<OaiResponse>;
  private subQuestion = new BehaviorSubject<OaiRequest>(new OaiRequest());
  
  constructor(
    private oaiSvc: OaiService
  ) { 
    window.ChatPageComponent = this;
  }

  ngOnInit(): void {

    this.subQuestion.pipe(
      share(),
      // wait 300ms after each keystroke before considering the term
      // debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged((p: OaiRequest, c: OaiRequest) => JSON.stringify(p) === JSON.stringify(c)), // p.question === c.question && p.type === c.type),

      // switch to new search observable each time the term changes
      switchMap((req: OaiRequest) => this.oaiSvc.getAnswer(req.type, req.question)),

    ).subscribe((res: OaiResponse) => {
      this.id = (new Date).getTime().toString();
      console.log(res);
      this.answer = res.messages.find((r: OaiMessage) => r.sender === 'assistant')?.text || '';
      let q = res.messages.find((r: OaiMessage) => r.sender === 'user')?.text || '';      
      this.history.push({ question: q, answer: this.answer });
      this.loading = false;
    });
  }

  onSendQuestion(e: OaiRequest): void {
    console.log(e);
    this.subQuestion.next(e);
    this.loading = true;
  }

  openPanel() {
    this.panel.nativeElement.style.display = 'block';
  }

  setCommand(code: string) {
    let arr = code.split(' ');
    let toolName = arr[0];
    let commandName = arr[1];
    this.tool.nativeElement.innerText = toolName;
    this.command.nativeElement.innerText = commandName;
    this.code.nativeElement.innerText = code;
  }

  sendCommand() {
  let b = confirm('Are you sure you want to send this command for pipeline execution?');
  if(b) {
    let toolName = this.tool.nativeElement.innerText;
    let commandName = this.command.nativeElement.innerText;
    let args = `${toolName} ${commandName} ${this.targetName}`;
    window.OaiService.sendCommandMessage(args).subscribe(
      (response: any) => {
        console.log(response);
      }
    );
  }
  }

}

window.onCodeClick = (e: any): void => {
  window.ChatPageComponent.setCommand(e.trim());
  window.ChatPageComponent.openPanel();
}

window.showElement = (elem: any): void => {
  elem.style.display = 'block';
}
window.hideElement = (elem: any): void => {
  elem.style.display = 'none';
}