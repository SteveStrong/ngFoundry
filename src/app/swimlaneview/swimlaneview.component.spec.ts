import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimlaneviewComponent } from './swimlaneview.component';

describe('SwimlaneviewComponent', () => {
  let component: SwimlaneviewComponent;
  let fixture: ComponentFixture<SwimlaneviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwimlaneviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimlaneviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
