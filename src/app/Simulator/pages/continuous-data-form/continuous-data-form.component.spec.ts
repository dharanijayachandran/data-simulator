import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuousDataFormComponent } from './continuous-data-form.component';

describe('ContinuousDataFormComponent', () => {
  let component: ContinuousDataFormComponent;
  let fixture: ComponentFixture<ContinuousDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinuousDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinuousDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
