import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeitemComponent } from './treeitem.component';

describe('TreeitemComponent', () => {
  let component: TreeitemComponent;
  let fixture: ComponentFixture<TreeitemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeitemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
