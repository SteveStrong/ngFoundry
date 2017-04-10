import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebglviewComponent } from './webglview.component';

describe('WebglviewComponent', () => {
  let component: WebglviewComponent;
  let fixture: ComponentFixture<WebglviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebglviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebglviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
