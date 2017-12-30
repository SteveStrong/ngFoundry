import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { foPanelComponent } from './fo-panel.component';

describe('foPanelComponent', () => {
  let component: foPanelComponent;
  let fixture: ComponentFixture<foPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ foPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(foPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
