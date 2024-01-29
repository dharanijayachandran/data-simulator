import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantDataFormComponent } from './instant-data-form.component';

describe('InstantDataFormComponent', () => {
  let component: InstantDataFormComponent;
  let fixture: ComponentFixture<InstantDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstantDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
