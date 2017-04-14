import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestForcediagramComponent } from './test-forcediagram.component';

describe('TestForcediagramComponent', () => {
  let component: TestForcediagramComponent;
  let fixture: ComponentFixture<TestForcediagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestForcediagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestForcediagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
