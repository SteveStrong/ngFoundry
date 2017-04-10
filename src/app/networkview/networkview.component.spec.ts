import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkviewComponent } from './networkview.component';

describe('NetworkviewComponent', () => {
  let component: NetworkviewComponent;
  let fixture: ComponentFixture<NetworkviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
