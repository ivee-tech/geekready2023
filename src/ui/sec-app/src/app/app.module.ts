import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GuideComponent } from './components/guide/guide.component';
import { SarifViewerComponent } from './components/sarif-viewer/sarif-viewer.component';
import { SarifViewerPageComponent } from './pages/sarif-viewer-page/sarif-viewer-page.component';
import { FormsModule } from '@angular/forms';
import { CodePipe } from './pipes/code.pipe';
import { ChatComponent } from './components/chat/chat.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';

import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatRadioModule} from '@angular/material/radio';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    GuideComponent,
    SarifViewerComponent,
    SarifViewerPageComponent,
    CodePipe,
    ChatComponent,
    ChatPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatRadioModule,
    MatProgressSpinnerModule,

    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
