import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSvgCircleComponent } from './test-svg-circle.component';

describe('TestSvgCircleComponent', () => {
  let component: TestSvgCircleComponent;
  let fixture: ComponentFixture<TestSvgCircleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestSvgCircleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSvgCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
