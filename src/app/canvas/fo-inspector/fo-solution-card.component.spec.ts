import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { foSolutionCardComponent } from './fo-solution-card.component';

describe('foSolutionCardComponent', () => {
  let component: foSolutionCardComponent;
  let fixture: ComponentFixture<foSolutionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ foSolutionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(foSolutionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
