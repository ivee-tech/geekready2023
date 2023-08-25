import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SarifViewerPageComponent } from './sarif-viewer-page.component';

describe('SarifViewerPageComponent', () => {
  let component: SarifViewerPageComponent;
  let fixture: ComponentFixture<SarifViewerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SarifViewerPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SarifViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
