import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { foDrawingComponent } from './fo-drawing.component';

describe('foDrawingComponent', () => {
  let component: foDrawingComponent;
  let fixture: ComponentFixture<foDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ foDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(foDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
