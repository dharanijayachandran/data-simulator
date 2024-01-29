import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContinuousDataFormComponent } from './Simulator/pages/continuous-data-form/continuous-data-form.component';
import { DataSimulatorFormComponent } from './Simulator/pages/data-simulator-form/data-simulator-form.component';
import { InstantDataFormComponent } from './Simulator/pages/instant-data-form/instant-data-form.component';


const routes: Routes = [
  {
    path:'',
    component:DataSimulatorFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/dataSimulator' },
  ],
})
export class AppRoutingModule { }
export const dataSimulatorManagementDeclaration=[
  InstantDataFormComponent,
  DataSimulatorFormComponent,
  ContinuousDataFormComponent
]
