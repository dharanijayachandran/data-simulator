import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { UIModalNotificationPage } from 'global';
import { globalSharedService } from 'src/app/shared/services/global/globalSharedService';
import { GateWayTemplate } from '../../model/gate-way-template';
import { InstanceDateTimeForm } from "../../model/gateway";
import { InstantData } from '../../model/instant-data';
import { DataSimulatorService } from '../../services/data-simulator.service';
@Component({
  selector: 'app-instant-data-form',
  templateUrl: './instant-data-form.component.html',
  styleUrls: ['./instant-data-form.component.css']
})
export class InstantDataFormComponent implements OnInit, OnDestroy {
  instantDataForm: FormGroup;


  // @ViewChild('defaultCheck')
  // public ddTreeObj: DropDownTreeComponent;

  @ViewChild(UIModalNotificationPage) modelNotification;

  instanceDateTimeForm: InstanceDateTimeForm;
  showLoaderImage: boolean;
  gatewayTemplateList: GateWayTemplate[];
  gateWayList: any[];
  communicationProtocolList: any[];
  communicationProtocolList1: any[];

  communicationProtocols: any[];

  dataHandlerList: any[];
  dataHandlerForMultiSelect: any[];
  isSelected = false;
  dataHandlerTagsList: any[];
  minDate: { month: number; day: number; year: number; };
  currentTime: any;
  validateTime = false;
  isDisabled: false;
  showListOfReport = false;
  todayDate: { month: number; day: number; year: number; };
  endDate: { month: number; day: number; year: number; };
  curDate: string;
  private instantData: InstantData = new InstantData();
  settings = {};
  selecteDataHandlerItems: any[] = [];
  enableViewButton: boolean = true;
  dataHandlerIds: any[] = [];
  dataTypes: any[];
  validTime: boolean;
  childDataHandlerTagsList: any[];
  commProtocolMap = new Map();
  inter: NodeJS.Timeout;

  public gatewayTemplateFields: Object = {
    text: 'name',
    value: 'id'
  };
  public gatewayFields: Object = {
    text: 'name',
    value: 'id'
  };
  public dataHandlerFields: Object = {
    text: 'name',
    value: 'id'
  };
  // filtering event handler to filter a Menu Icon Name
  //pass the filter data source, filter query to updateData method.
  public onFilteringGatewayTemplates: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.filterData(e, this.gatewayTemplateList);
  }
  public onFilteringGateway: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.filterData(e, this.gateWayList);
  }
  public onFilteringDataHandler: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.filterData(e, this.dataHandlerList);
  }
  filterData(e: FilteringEventArgs, filterData) {
    let query: Query = new Query();
    //frame the query based on search string with filter type.
    query = (e.text !== '') ? query.where('name', 'contains', e.text, true) : query;
    e.updateData(filterData, query);
  }

  public sortDropDown: string = 'Ascending';
  gateWayId: any;
  gateWayTemplateId: any;
  dataHandlerId: any;
  communicationProtocolId:any;
  // set the placeholder to DropDownList input element
  public gatewayWaterMark: string = 'Select Gateway';
  public dataHandlerWaterMark: string = 'Select Data Handler';
  public gatewayTemplateWaterMark: string = 'Select Gateway Template';
  public filterPlaceholder: string = 'Search';
  // set the height of the popup element
  public height: string = '220px';
  public locale: string;


  constructor(private formBuilder: FormBuilder, private dataSimulatorService: DataSimulatorService, private globalService: globalSharedService) {
    this.inter = setInterval(() => { this.currentTime = new Date().getHours() + ':' + new Date().getMinutes() }, 1);
  }

  ngOnInit(): void {
    this.registerForm();
    this.gatewayTemplates();
    this.getDataTypes();
    this.getCommProtocol();
  }

  ngOnDestroy() {
    clearInterval(this.inter);
  }

  registerForm() {
    this.instantDataForm = this.formBuilder.group({
      gateWayTemplateId: [null, [Validators.required]],
      gateWayId: [null, [Validators.required]],
      communicationProtocolId: [null, [Validators.required]],
      dataHandlerId: [null, [Validators.required]],
      dhTags: this.formBuilder.array([]),
      startDate: [null, Validators.required],
      startTime: [null, [Validators.required]],
    });
    this.instantDataForm.controls['startDate'].valueChanges.subscribe(data => {
      if (!data || (typeof data === 'string' && data.length == 0)) {
        this.instantDataForm.patchValue({
          startDate: null
        }, { emitEvent: false });
      } else {
      }
    });
    this.patchDates();
    this.futureDateDisabled();
    this.settings = {
      text: "--Select--",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: "myclass custom-class",
      badgeShowLimit: 0,
    };
  }


  startTime = new FormControl('startTime', (control: FormControl) => {
    const value = control.value;
    if (!value) {
      return { required: true };
    }
    return null;
  });


  gatewayTemplates() {
    let beId = sessionStorage.getItem('beId');
    this.dataSimulatorService.getGateWayTemplate(beId).subscribe(res => {
      this.gatewayTemplateList = res;
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      }
    );
  }
  getCommProtocol() {
    this.dataSimulatorService.getAllCommProtocol().subscribe(res => {
      res.forEach(obj => {
        this.commProtocolMap.set(obj.id, obj);
      });
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      }
    );

  }

  gateWayTemplateChange(gateWayTemplateId) {
    if (isNaN(gateWayTemplateId)) {
      this.gateWayList = [];

    } else {
      this.gatewayTemplateList.forEach(obj => {
        if (obj.id == gateWayTemplateId) {
          this.getGateway(obj.id);
        }
      });
    }
  }

  gateWayChange(gatewayId) {
     let gateWayId = gatewayId.itemData.id;
    this.dataSimulatorService.getCommProtocolsByGatewayId(gateWayId).subscribe(res => {
      this.communicationProtocolList = res;
      for (let communicationProtocol of this.communicationProtocols) {
        if (communicationProtocol.commProtocol === null || communicationProtocol.commProtocol === undefined) {
          let commId = communicationProtocol.commProtocolId;
          communicationProtocol.commProtocol = this.commProtocolMap.get(commId)
          this.communicationProtocolList = this.communicationProtocols
        }
        else {
          this.communicationProtocolList = this.communicationProtocolList1
        }
      }
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      }
    );
  }

  commProtocolChange(event: any) {
    let commId = event.target.value;
    for (let comm of this.communicationProtocolList) {
      if (commId == comm.id) {
        this.getDataHandler(commId)

      }
    }
  }

  dHChange(event) {
    let dhId = event.itemData.id;
    for (let dh of this.dataHandlerList) {
      if (dhId == dh.id) {
        this.getDhTags(dhId)
      }
    }

  }
  getDhTags(dhId: any) {
    this.dataSimulatorService.getAllDHTags(dhId).subscribe(res => {
      //filter parent Tags Starts hers
      var map = new Map();
      res.forEach(obj => {
        map.set(obj.id, obj);
      });

      this.childDataHandlerTagsList = res.filter(function (obj) {
        return obj.parentNodeIoDhTagId;
      });
      this.childDataHandlerTagsList.forEach(element => {
        if (map.has(element.parentNodeIoDhTagId)) {
          map.delete(element.parentNodeIoDhTagId)
        }
      });

      this.dataHandlerTagsList = Array.from(map.values());
      //filter parent tags ends here


      this.isSelected = true;
      const control = <FormArray>this.instantDataForm.controls['dhTags'];
      for (let i = control.length - 1; i >= 0; i--) {
        control.removeAt(i)
      }

      if (this.dataHandlerTagsList != null) {
        this.instantDataForm.setControl('dhTags', this.patchFormArray());
      }
    },
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      }
    );

  }
  patchFormArray(): FormArray {
    const formArray = new FormArray([]);
    this.dataHandlerTagsList.forEach(dhTag => {
      this.dataTypes.forEach(type => {
        if (type.id == dhTag.nodeIoTag.dataTypeId) {
          dhTag.dataTypeName = type.name;
        }
      })
      formArray.push(this.formBuilder.group({
        id: [null],
        nodeIoDhId: [null],
        nodeIoDhTagId: [null],
        nodeIoIOTagId: [null],
        value: ['',
          [Validators.required,
          Validators.pattern(this.checkDataTypeName(dhTag))]]
      }))
    })
    return formArray;
  }

  checkDataTypeName(dhTag) {
    if (dhTag.hasOwnProperty("dataTypeName"))
      return this.getPatternForCommunication(dhTag.dataTypeName);

  }

  getPatternForCommunication(dataType): any {
    switch (dataType) {
      case 'String': {
        return "";
      }
      case 'Integer': {
        return "[0-9]*";
      }
      case 'Long': {
        return "[0-9]*";
      }
      case 'Double': {
        return /^[0-9]*(\.\d[0-9]*)?%?$/
      }
      case 'Float': {
        return /^[0-9]*(\.\d[0-9]*)?%?$/
      }
      default: {
        return "";
      }
    }

  }
  getDataTypes(): void {
    this.dataSimulatorService.getDataTypes()
      .subscribe(
        res => {
          this.dataTypes = res as any[];
        },
        error => {
          this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
        });
  }

  public addDhTags(): FormGroup {
    return this.formBuilder.group({
      id: [null],
      value: [null],
      nodeIoDhId: [null],
      nodeIoDhTagId: [null]
    })
  }






  getDataHandler(id: any) {
    this.dataSimulatorService.getDataHandler(id).subscribe(res => {
      this.dataHandlerList = res;
      this.dataHandlerForMultiSelect = this.requiredFormat(res);

    },
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      }
    );

  }
  requiredFormat(items) {
    const that = this;
    return items && items.length ? items.map(function (o) {
      var returnObj = {
        "id": o.id,
        "itemName": o.name
      }
      return returnObj;
    }) : [];
  }

  getGateway(id: any) {
    this.dataSimulatorService.getGateWays(id).subscribe(res => {
      this.gateWayList = res;
    },
      (error: any) => {
        // If the service is not available

        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      }
    );
  }

  addMinDateValue() {
    let startDate = this.fetchStartDateFromPicker();
    if (null != startDate) {
      let fullDate = startDate.split('/');
      this.minDate =
      {
        month: parseInt(fullDate[0]),
        day: parseInt(fullDate[1]),
        year: parseInt(fullDate[2]),
      }
    }
  }

  fetchStartDateFromPicker() {
    if (null != this.instantDataForm.value.startDate) {
      let newYrs = this.instantDataForm.value.startDate.year;
      let newDay = this.instantDataForm.value.startDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.instantDataForm.value.startDate.month;

      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let reqDateOfBirth = newMon + '/' + newDay + '/' + newYrs;
      return reqDateOfBirth;
    }
  }



  validateStartAndEndTime() {
    this.validateTime = false;
    let startDate = this.fetchStartDateFromPicker()
    let endDate = this.fetchEndDateFromPicker()
    if (startDate === endDate) {
      this.instanceDateTimeForm = <InstanceDateTimeForm>this.instantDataForm.value
      let startTime = this.instanceDateTimeForm.startTime
      let endTimeTime = this.instanceDateTimeForm.endTime
      let strtHr, strtMin, endHr, endMin
      if (startTime.length != 0) {
        let startTimeArray = startTime.split(':')
        strtHr = parseInt(startTimeArray[0]);
        strtMin = parseInt(startTimeArray[1]);
      }
      if (endTimeTime.length != 0) {
        let endTimeTimeArray = endTimeTime.split(':')
        endHr = parseInt(endTimeTimeArray[0]);
        endMin = parseInt(endTimeTimeArray[1]);
      }
      if (strtHr >= endHr) {
        if (strtMin >= endMin) {
          this.validateTime = true
        } if (strtHr > endHr) {
          this.validateTime = true
        }
        this.instantDataForm.setErrors({ 'invalid': true });
      }
    }


  }

  fetchEndDateFromPicker() {
    if (null != this.instantDataForm.value.endDate) {
      let newDay = this.instantDataForm.value.endDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.instantDataForm.value.endDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.instantDataForm.value.endDate.year;
      let reqDateOfBirth = newMon + '/' + newDay + '/' + newYrs;
      return reqDateOfBirth;
    }
  }
  resetForm() {

    this.gatewayTemplateList = [];

    this.gateWayList = [];

    this.communicationProtocolList = [];
    this.dataHandlerList = [];
    this.isSelected = true;
    this.dataHandlerTagsList = [];
    this.registerForm();
    this.gatewayTemplates();
    this.getDataTypes();
  }



  patchDates() {
    this.showListOfReport = false;
    let endDate = new Date();
    let startDate = formatDate(endDate, 'MM/dd/yyyy HH:mm', 'en');
    let arrayDate = startDate.split('/');
    let time = arrayDate[2];
    let currentTime = time.split(' ');

    let fullDate = {
      month: parseInt(arrayDate[0]),
      day: parseInt(arrayDate[1]),
      year: parseInt(arrayDate[2])
    }

    this.instantDataForm.patchValue({
      startDate: fullDate,
      endDate: fullDate,
      startTime: currentTime[1]
      //endTime: ''
    })
  }

  futureDateDisabled() {
    this.curDate = formatDate(new Date(), 'MM/dd/yyyy', 'en');
    let fullDate = this.curDate.split('/');
    this.todayDate =
    {
      month: parseInt(fullDate[0]),
      day: parseInt(fullDate[1]),
      year: parseInt(fullDate[2])
    }
    this.minDate = this.todayDate;
    this.endDate = this.todayDate
  }


  sendForm() {
    this.showLoaderImage = true;
    this.instantData = <InstantData>this.instantDataForm.value
    let startDate = this.fetchStartDateFromPickerForApiCall();
    let startTime = this.instantDataForm.value.startTime;
    if (startTime == null) {
      this.validTime = true;
      return null;
    }
    if (startTime === 'startTime') {
      startTime = ''
    }
    if (startTime.length == 0) {
      startTime = '00:00:00'
    }
    startDate = startDate + 'T' + startTime;
    this.instantData.startDate = startDate;
    this.dataSimulatorService.sendInstantDataForm(this.instantData).subscribe((res) => {
      this.showLoaderImage = false;
      this.modelNotification.alertMessage('Success', 'Data simulator activated successfully');
      this.redirect();

    },
      (error: any) => {
        this.showLoaderImage = false;
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, 'Failed to activate data simulator');
        this.resetForm()

      }
    );
  }
  redirect() {
    this.instantDataForm.reset();
    this.registerForm();
    this.dataHandlerList = [];
  }

  onItemSelectDataHandler(item: any) {
    this.selecteDataHandlerItems.push(item);
    this.onClickOfFilterFields();
  }

  onClickOfFilterFields() {

    let startDate = this.fetchStartDateFromPickerForApiCall();
    let endDate = this.fetchEndDateFromPickerForApiCall();

    if (this.selecteDataHandlerItems.length != 0 ||
      this.selecteDataHandlerItems.length != 0 || startDate != null || endDate != null) {
      this.enableViewButton = false;
    } else {
      this.enableViewButton = true;
    }
  }

  fetchStartDateFromPickerForApiCall() {
    if (null != this.instantDataForm.value.startDate) {
      let newDay = this.instantDataForm.value.startDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.instantDataForm.value.startDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.instantDataForm.value.startDate.year;
      let reqDateOfBirth = newDay + '/' + newMon + '/' + newYrs;
      return reqDateOfBirth;
    }
  }

  fetchEndDateFromPickerForApiCall() {
    if (null != this.instantDataForm.value.endDate) {
      let newDay = this.instantDataForm.value.endDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.instantDataForm.value.endDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.instantDataForm.value.endDate.year;
      let reqDateOfBirth = newYrs + '-' + newMon + '-' + newDay;
      return reqDateOfBirth;
    }
  }


  OnItemDeSelectDataHandler(item: any) {
    this.selecteDataHandlerItems = this.selecteDataHandlerItems.filter(obj => obj !== item);
    this.onClickOfFilterFields();
  }
  onSelectAllDataHandler(items: any) {
    this.selecteDataHandlerItems = items;
    this.onClickOfFilterFields();
  }
  onDeSelectAllDataHandlers(items: any) {
    this.selecteDataHandlerItems = [];
    this.onClickOfFilterFields();
  }


}

