import { Component, Input, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-sarif-viewer',
  templateUrl: './sarif-viewer.component.html',
  styleUrls: ['./sarif-viewer.component.css']
})
export class SarifViewerComponent implements OnInit {

  @Input() data: any;

  rules: any[] = [];
  ruleCount: number = 0;
  filterText: string = '';
  level: string = 'ALL';
  levels: string[] = [ 'ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL' ];
  results: { [ruleId: string]: any[] } = {};

  constructor() { }

  ngOnInit(): void {
    this.display();
  }

  ngOnChanges(): void {
    this.display();
  }

  onFilterChange(e: Event) {
    this.filterRules(this.filterText);
  }

  onFilterByLevelChange(e: MatRadioChange) {
    this.filterRulesByLevel(e.value);
  }

  filterRules(text: string = '') {
    if(!this.data.runs || this.data.runs.length === 0) {
      this.rules = [];
      return;
    }
    if (text === '') {
      this.rules = this.data.runs[0].tool.driver.rules;
    } else {
      this.rules = this.data.runs[0].tool.driver.rules.filter((rule: any) => {
        return rule.id.toLowerCase().includes(text.toLowerCase())
          || rule.name.toLowerCase().includes(text.toLowerCase())
          || rule.defaultConfiguration?.level.toLowerCase().includes(text.toLowerCase())
          || rule.fullDescription.text.toLowerCase().includes(text.toLowerCase())
          || rule.help.text.toLowerCase().includes(text.toLowerCase())
          ;
      });
    }
    this.ruleCount = this.rules.length;
  }

  filterRulesByLevel(level: string) { // LOW, MEDIUM, HIGH, CRITICAL
    if(!this.data.runs || this.data.runs.length === 0) {
      this.rules = [];
      return;
    }
    if (level === '' || level === 'ALL') {
      this.rules = this.data.runs[0].tool.driver.rules;
    } else {
      this.rules = this.data.runs[0].tool.driver.rules.filter((rule: any) => {
        return rule.properties.tags.includes(level);
      });
    }
    this.ruleCount = this.rules.length;
  }

  showHideAllResults() {
    for (let rule of this.rules) {
      rule.showResults = !rule.showResults;
    }
  }

  display() {
    this.level = 'ALL';
    if(!this.data.runs || this.data.runs.length === 0) {
      return;
    }
    this.filterRules();
    this.data.runs[0].results.forEach((result: any) => {
      result.message.displayText = result.message.text.replace('\n', '<br/>');
      if (!this.results[result.ruleId] || this.results[result.ruleId].length === 0) {
        this.results[result.ruleId] = [result];
      }
      else {
        this.results[result.ruleId].push(result);
      }
    });
    this.showHideAllResults();
  }

}
