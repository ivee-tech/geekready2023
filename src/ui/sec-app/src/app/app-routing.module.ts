import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuideComponent } from './components/guide/guide.component';
import { AppComponent } from './app.component';
import { SarifViewerPageComponent } from './pages/sarif-viewer-page/sarif-viewer-page.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';

const routes: Routes = [
  { path: 'guide', component: GuideComponent },
  { path: 'sarif-viewer', component: SarifViewerPageComponent },
  { path: 'chat', component: ChatPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
