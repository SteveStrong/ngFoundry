import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShapeTestingComponent } from './shape-testing.component';

describe('ShapeTestingComponent', () => {
  let component: ShapeTestingComponent;
  let fixture: ComponentFixture<ShapeTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShapeTestingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShapeTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
