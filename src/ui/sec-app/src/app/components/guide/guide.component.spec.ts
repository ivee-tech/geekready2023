import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GuideComponent } from './guide.component';

describe('GuideComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        GuideComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(GuideComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'sec-app'`, () => {
    const fixture = TestBed.createComponent(GuideComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Guide');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(GuideComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('Guide is running!');
  });
});
