import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { foModelComponent } from './fo-model.component';

describe('foModelComponent', () => {
  let component: foModelComponent;
  let fixture: ComponentFixture<foModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ foModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(foModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
