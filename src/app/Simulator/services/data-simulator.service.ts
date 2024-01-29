import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { InstantData, ContinuousData } from '../model/instant-data';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

export class DataSimulatorService {

  gateWayApiurl = environment.baseUrl_gatewayManagement;
  dataSimulatorApiUrl = environment.baseUrl_dataSimulatorManagement;

  constructor(private http: HttpClient) { }


  getGateWayTemplate(beId) {
    return this.http.get<any[]>(this.gateWayApiurl + 'gatewayTemplatesByBusinessEntityId/' + beId)
  }
  getGateWays(gatewayTemplateId) {
    let organizationId = sessionStorage.getItem("beId");
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'organization/' + organizationId + '/gateways?gateway-template-id=' + gatewayTemplateId)
  }

  getDataHandler(commProtocolId) {
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'getDataHandlerByCommonProtocolId/' + commProtocolId)

  }

  getAllDHTags(iOdHId) {
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'getAllIODHTagByIODHId/' + iOdHId)

  }
  getDataTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.gateWayApiurl + 'getDataTypes');
  }

  getAllDHTagsByGateWayTemplateId(gateWayTemplateId) {
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'getAllGatewayIOTagByGatewayId/' + gateWayTemplateId)

  }
  getGatewayTemplateByTemplateId(gateWayTemplateId) {
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'getNodeWithAllChildsByID/' + gateWayTemplateId)
  }
  getDataHandlersByDHIds(datahandlerIds) {
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'getDataHandlerTagsByIds/' + datahandlerIds)
  }

  sendInstantDataForm(instantData: InstantData): Observable<InstantData> {
    return this.http.post<InstantData>(`${this.dataSimulatorApiUrl + 'sendInstantData'}`, instantData, httpOptions);
  }


  sendContinuousDataForm(continuousData: ContinuousData): Observable<ContinuousData> {
    return this.http.post<ContinuousData>(`${this.dataSimulatorApiUrl + 'sendContinuousData'}`, continuousData, httpOptions);
  }

  getAllCommProtocol(): Observable<any[]> {
    return this.http.get<any[]>(this.gateWayApiurl + 'getAllProtocol');
  }

  loadProperties(): Observable<any> {
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'loadProperties');

  }

  getCommProtocolsByGatewayId(gatewayId): Observable<any[]> {
    return this.http.get<any[]>(this.dataSimulatorApiUrl + 'gateway-CommProtocols/' + gatewayId);
  }

}
