import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSimulatorFormComponent } from './data-simulator-form.component';

describe('DataSimulatorFormComponent', () => {
  let component: DataSimulatorFormComponent;
  let fixture: ComponentFixture<DataSimulatorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSimulatorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSimulatorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
