import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SarifViewerComponent } from './sarif-viewer.component';

describe('SarifViewerComponent', () => {
  let component: SarifViewerComponent;
  let fixture: ComponentFixture<SarifViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SarifViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SarifViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
