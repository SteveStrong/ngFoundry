import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { foStencilComponent } from './fo-stencil.component';

describe('foStencilComponent', () => {
  let component: foStencilComponent;
  let fixture: ComponentFixture<foStencilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ foStencilComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(foStencilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
