import { Component, OnInit } from '@angular/core';
import d1 from '../../../assets/data/aspnet-runtime-v7.0.json';
import d2 from '../../../assets/data/credscan-matches.json';
import d3 from '../../../assets/data/results-calculator-api-0.0.1-localk8s-pubsub.json';
import d4 from '../../../assets/data/linux-devops-agent_2.211.0.json';
import d5 from '../../../assets/data/dotnet-7-0.json';
import d6 from '../../../assets/data/demo1.json';
import { OaiService } from 'src/app/services/oai-service.service';

@Component({
  selector: 'app-sarif-viewer-page',
  templateUrl: './sarif-viewer-page.component.html',
  styleUrls: ['./sarif-viewer-page.component.css']
})
export class SarifViewerPageComponent implements OnInit {

  constructor(
    private oaiSvc: OaiService
  ) { }

  // Variable to store shortLink from api response
  loading: boolean = false; // Flag variable
  file!: File; // Variable to store file
  data: any;

  ngOnInit(): void {
    this.data = {};
  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  onUpload() {
    this.loading = !this.loading;
    // console.log(this.file);
    this.data = {};
    this.oaiSvc.upload(this.file).subscribe(
      (response: any) => {
        this.loading = false; // Flag variable
        console.log(response);
        this.data = response.data;
      }
    );
  }
}
