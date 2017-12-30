import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { foInspectorComponent } from './fo-inspector.component';

describe('foInspectorComponent', () => {
  let component: foInspectorComponent;
  let fixture: ComponentFixture<foInspectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ foInspectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(foInspectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
