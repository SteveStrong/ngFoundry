import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DockerecosystemComponent } from './dockerecosystem.component';

describe('DockerecosystemComponent', () => {
  let component: DockerecosystemComponent;
  let fixture: ComponentFixture<DockerecosystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DockerecosystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DockerecosystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
