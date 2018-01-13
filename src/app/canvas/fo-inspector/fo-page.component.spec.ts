import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { foPageComponent } from './fo-page.component';

describe('foPageComponent', () => {
  let component: foPageComponent;
  let fixture: ComponentFixture<foPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ foPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(foPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
