import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSceen1Component } from './test-sceen1.component';

describe('TestSceen1Component', () => {
  let component: TestSceen1Component;
  let fixture: ComponentFixture<TestSceen1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestSceen1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSceen1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
