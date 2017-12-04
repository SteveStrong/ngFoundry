import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvastestComponent } from './canvastest.component';

describe('CanvastestComponent', () => {
  let component: CanvastestComponent;
  let fixture: ComponentFixture<CanvastestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvastestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvastestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
