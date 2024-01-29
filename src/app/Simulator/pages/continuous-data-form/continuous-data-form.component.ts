import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';

import { DataSimulatorService } from '../../services/data-simulator.service';
import { ContinuousForm } from "../../model/gateway";
import { formatDate } from '@angular/common';
import { ContinuousData } from '../../model/instant-data';
import { UIModalNotificationPage } from 'global';
import { EmitType } from '@syncfusion/ej2-base';
import { FilteringEventArgs } from '@syncfusion/ej2-dropdowns';
import { Query } from '@syncfusion/ej2-data';
import { globalSharedService } from 'src/app/shared/services/global/globalSharedService';

@Component({
  selector: 'app-continuous-data-form',
  templateUrl: './continuous-data-form.component.html',
  styleUrls: ['./continuous-data-form.component.css']
})
export class ContinuousDataFormComponent implements OnInit, OnDestroy {

  childDataHandlerTagsList: any[];
  continuousDataForm: FormGroup;
  selectedGateWayItems: any[] = [];
  selectedDataHandlers = [];
  dataHandlerIds = [];
  uniqueDataHandlerIds: any[];
  ids: any;
  gateWayIds: any[] = [];
  showLoaderImage: boolean;
  settings = {};
  dataHandlerSettings = {};
  isDisabled: false;
  continuousForm: ContinuousForm;
  gatewayTemplateList: any[];
  gatewayTemplate: any;
  nodeIODHs: any[];
  gateWayList: any[];
  todayDate: { month: number; day: number; year: number; };
  minDate: { month: number; day: number; year: number; };
  endDate: { month: number; day: number; year: number; };
  curDate: string;
  gateWayForMultiSelect: any[] = [];
  dataHandlersForMultiSelect: any = [];
  communicationProtocolList: any[];
  dataHandlerTagsList: any[];
  dataTypes: any[];
  gatewayComm: any[];
  dataHandlers: any[];
  dataHandlerTags: any[];
  continuousData: ContinuousData = new ContinuousData();
  gatewayLimit: number
  dataHandlerLimit: number


  validTime = false;
  validateTime = false;
  showListOfReport = false;
  currentTime: any;
  enableViewButton: boolean = true;
  isSelected = true;
  @ViewChild(UIModalNotificationPage) modelNotification;




  inter: NodeJS.Timeout;
  validateEndTime: boolean;
  disableButton: boolean;
  response:boolean = false;
  commProtocolMap = new Map();

  public gatewayTemplateFields: Object = {
    text: 'name',
    value: 'id'
  };
  // filtering event handler to filter a Menu Icon Name
  //pass the filter data source, filter query to updateData method.
  public onFilteringGatewayTemplates: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.filterData(e, this.gatewayTemplateList);
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
  // set the placeholder to DropDownList input element
  public gatewayTemplateWaterMark: string = 'Select Gateway Template';
  public filterPlaceholder: string = 'Search';
  // set the height of the popup element
  public height: string = '220px';
  public locale: string;

  constructor(private formBuilder: FormBuilder, private dataSimulatorService: DataSimulatorService, private globalService: globalSharedService) {
    this.inter = setInterval(() => { this.currentTime = new Date().getHours() + ':' + new Date().getMinutes() }, 1);
  }

  ngOnInit() {
    this.loadProperties()
  }
  loadProperties() {
    this.dataSimulatorService.loadProperties().subscribe(res => {
      let gateway= res['gateways'];
      let dataHandler = res['dataHandlers']
      this.gatewayLimit=parseInt(gateway)
      this.dataHandlerLimit=parseInt(dataHandler)
      this.getCommProtocol();
      this.gatewayTemplates();
      this.getDataTypes();
      this.registerForm();
    },
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);

      }
    );

  }
  registerForm() {
    this.continuousDataForm = this.formBuilder.group({
      gateWayTemplateId: [null, Validators.required],
      commProtocolId: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      dhTags: this.formBuilder.array([]),
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      gateWayIds: [[], [Validators.required]],
      dataHandlers: [[], [Validators.required]]
    });
    this.continuousDataForm.controls['startDate'].valueChanges.subscribe(data => {
      if (!data || (typeof data === 'string')) {
        this.continuousDataForm.patchValue({
          startDate: null
        }, { emitEvent: false });
      }
    });
    this.settings = {
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: "myclass custom-class",
      badgeShowLimit: 0,
      enableSearchFilter: true,
      text: $localize`:@@multiSelectDropdown.select:--Select--`,
      noDataLabel: $localize`:@@multiSelectDropdown.noDataLabel:No Data Available`,
      limitSelection: this.gatewayLimit

    };
    this.dataHandlerSettings = {
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: "myclass custom-class",
      badgeShowLimit: 0,
      enableSearchFilter: true,
      text: $localize`:@@multiSelectDropdown.select:--Select--`,
      noDataLabel: $localize`:@@multiSelectDropdown.noDataLabel:No Data Available`,
      limitSelection: this.dataHandlerLimit

    };
    this.patchDates();
    this.futureDateDisabled();
  }

  ngOnDestroy() {
    clearInterval(this.inter);
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
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);

      }
    );
  }

  gateWayTemplateChange(gateWayTemplateId) {
    if (isNaN(gateWayTemplateId)) {
      this.gateWayList = [];

    } else {
      this.getNodeTemplateById(gateWayTemplateId);
      this.continuousDataForm.get('gateWayIds').setValue([]);

      //this.getDhTags(gateWayTemplateId);
      this.gatewayTemplateList.forEach(obj => {
        if (obj.id == gateWayTemplateId) {
          this.getGateway(obj.id);
        }
      });
    }
  }
  requiredFormatForDataHandlers(items) {
    const that = this;
    return items && items.length ? items.map(function (o) {
      var returnObj = {
        "id": o.id,
        "itemName": o.name,
        "dhCode": o.dhCode
      }
      return returnObj;
    }) : [];
  }

  dataHandlerChange(dataHandlersObj) {

  }



  getNodeTemplateById(gateWayTemplateId) {
    this.dataSimulatorService.getGatewayTemplateByTemplateId(gateWayTemplateId).subscribe(res => {
      this.gatewayTemplate = res;
      if (this.gatewayTemplate.gatewayCommProtocols) {
        this.gatewayComm = this.gatewayTemplate.gatewayCommProtocols;
      }
      this.gatewayComm.forEach(obj => {
        if (obj.commProtocol == null || obj.commProtocol == undefined) {
          if (this.commProtocolMap.has(obj.commProtocolId)) {
            obj.commProtocol = this.commProtocolMap.get(obj.commProtocolId);
          }
        }
      })


    },
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);

      }
    );
  }
  communctionProtocolChange(commId) {
    this.continuousDataForm.get('dataHandlers').setValue([]);
    this.dataSimulatorService.getDataHandler(commId).subscribe(res => {
      this.dataHandlers = res;
      this.dataHandlersForMultiSelect = this.requiredFormatForDataHandlers(this.dataHandlers);
    },
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
        this.resetForm();

      }
    );


  }
  getDhTagsByDHIds(dhIds) {
    this.dataSimulatorService.getDataHandlersByDHIds(dhIds).subscribe(res => {

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
      const control = <FormArray>this.continuousDataForm.controls['dhTags'];
      for (let i = control.length - 1; i >= 0; i--) {
        control.removeAt(i)
      }

      if (this.dataHandlerTagsList != null) {
        this.continuousDataForm.setControl('dhTags', this.patchFormArray());
      }
    },
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
        this.resetForm();
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
      if (dhTag.nodeIoTag.tagType == "A" && dhTag.dataTypeName != "String") {
        formArray.push(this.formBuilder.group({
          id: [null],
          nodeIoTagId: [null],
          value: ['',
            [Validators.required, Validators.pattern(this.checkDataTypeName(dhTag))]],
          maxvalue: ['',
            [Validators.required, Validators.pattern(this.checkDataTypeName(dhTag))]],
        }))

      }
      else if (dhTag.nodeIoTag.tagType == "A" && dhTag.dataTypeName == "String") {
        formArray.push(this.formBuilder.group({
          id: [null],
          nodeIoTagId: [null],

          desvalue: ['',
            [Validators.required, Validators.pattern(this.checkDataTypeNameforDiscrete(dhTag))]]
        }))


      }
      else if (dhTag.nodeIoTag.tagType == "D") {
        formArray.push(this.formBuilder.group({
          id: [null],
          nodeIoTagId: [null],
          desvalue: ['',
            [Validators.required, Validators.pattern(this.checkDataTypeNameforDiscrete(dhTag))]]
        }))

      }

    })


    return formArray;
  }
  checkDataTypeNameforDiscrete(dhTag) {
    if (dhTag.hasOwnProperty("dataTypeName"))
      return this.globalService.getPatternForDiscreterTag(dhTag.dataTypeName);

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
      nodeIoTagId: [null]

    })
  }
  getGateway(gateWayTemplateId: any) {
    this.dataSimulatorService.getGateWays(gateWayTemplateId).subscribe(res => {
      this.gateWayList = res;
      this.gateWayForMultiSelect = this.requiredFormat(res);

    },
      (error: any) => {
        // If the service is not available
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
        this.resetForm();
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

  validateFromDate() {
    let startDay = this.continuousDataForm.value.startDate.day;
    let endDay = this.continuousDataForm.value.endDate.day;
    if (startDay > endDay) {
      this.continuousDataForm.patchValue({
        startDate: this.fetchStartDateFromPicker()
      }, { emitEvent: false });
    }
    let endMonth = this.continuousDataForm.value.endDate.month;
    let startMonth = this.continuousDataForm.value.startDate.month;
    if (endMonth > startMonth) {
      this.continuousDataForm.patchValue({
        startDate: this.fetchStartDateFromPicker()
      }, { emitEvent: false });
    }
  }

  resetTimeValidationControlls() {
    this.validateTime = false;
    this.validateEndTime = false;
    this.disableButton = false
    this.continuousDataForm.controls['startTime'].markAsUntouched()
    this.continuousDataForm.controls['startTime'].markAsPristine()
    this.continuousDataForm.controls['startTime'].updateValueAndValidity();
    this.continuousDataForm.controls['endTime'].markAsUntouched()
    this.continuousDataForm.controls['endTime'].markAsPristine()
    this.continuousDataForm.controls['endTime'].updateValueAndValidity();
  }

  validateStartAndEndTime(id: any) {
    this.resetTimeValidationControlls()
    let startDate = this.fetchStartDateFromPicker()
    let endDate = this.fetchEndDateFromPicker()
    if (startDate === endDate) {
      this.continuousForm = <ContinuousForm>this.continuousDataForm.value
      let startTime = this.continuousForm.startTime
      let endTimeTime = this.continuousForm.endTime
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
      if (id == 'startTime') {
        if (strtHr >= endHr) {
          if (strtMin >= endMin) {
            this.validateTime = true
            this.continuousDataForm.controls['startTime'].markAsTouched();
            this.continuousDataForm.controls['startTime'].updateValueAndValidity();
            this.continuousDataForm.controls['startTime'].setErrors({
              'required': true
            })
          } if (strtHr > endHr) {
            this.validateTime = true
            this.continuousDataForm.controls['startTime'].markAsTouched();
            this.continuousDataForm.controls['startTime'].updateValueAndValidity();
            this.continuousDataForm.controls['startTime'].setErrors({
              'required': true
            })
          }

        }
      }
      else if (id == 'endTime') {
        if (strtHr >= endHr) {
          if (strtMin >= endMin) {
            this.validateEndTime = true

            this.continuousDataForm.controls['endTime'].markAsTouched();
            this.continuousDataForm.controls['endTime'].updateValueAndValidity();
            this.continuousDataForm.controls['endTime'].setErrors({
              'required': true
            })
          } if (strtHr > endHr) {
            this.validateEndTime = true

            this.continuousDataForm.controls['endTime'].markAsTouched();
            this.continuousDataForm.controls['endTime'].updateValueAndValidity();
            this.continuousDataForm.controls['endTime'].setErrors({
              'required': true
            })
          }

        }

      }

    }
    if (this.validateTime || this.validateEndTime) {
      this.disableButton = true
    }



  }

  fetchEndDateFromPicker() {
    if (null != this.continuousDataForm.value.endDate) {
      let newDay = this.continuousDataForm.value.endDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.continuousDataForm.value.endDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.continuousDataForm.value.endDate.year;
      let reqDateOfBirth = newMon + '/' + newDay + '/' + newYrs;
      return reqDateOfBirth;
    }
  }



  fetchStartDateFromPicker() {
    if (null != this.continuousDataForm.value.startDate) {
      let newYrs = this.continuousDataForm.value.startDate.year;
      let newDay = this.continuousDataForm.value.startDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.continuousDataForm.value.startDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let reqDateOfBirth = newMon + '/' + newDay + '/' + newYrs;
      return reqDateOfBirth;
    }
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
    this.continuousDataForm.patchValue({
      startDate: fullDate,
      endDate: fullDate,
      startTime: currentTime[1],
      endTime: '23:59'
    })
  }


  validateFromStartFromEndDate() {
    let date = this.fetchEndDateFromPicker()
    if (null != date) {
      let fullDate = date.split('/');
      this.endDate =
      {
        month: parseInt(fullDate[0]),
        day: parseInt(fullDate[1]),
        year: parseInt(fullDate[2]),
      }
      this.addMinDateValue();
    }
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


  OnselectedGateWayItems(item: any) {
    this.selectedGateWayItems.push(item);
  }

  onClickOfFilterFields() {

    let startDate = this.fetchStartDateFromPickerForApiCall();
    let endDate = this.fetchEndDateFromPickerForApiCall();

    if (
      this.selectedGateWayItems.length != 0 ||
      this.selectedGateWayItems.length != 0 || startDate != null || endDate != null) {
      this.enableViewButton = false;
    } else {
      this.enableViewButton = true;
    }
  }

  fetchStartDateFromPickerForApiCall() {
    if (null != this.continuousDataForm.value.startDate) {
      let newDay = this.continuousDataForm.value.startDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.continuousDataForm.value.startDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.continuousDataForm.value.startDate.year;
      let reqDateOfBirth = newDay + '/' + newMon + '/' + newYrs;
      return reqDateOfBirth;
    }
  }

  fetchEndDateFromPickerForApiCall() {
    if (null != this.continuousDataForm.value.endDate) {
      let newDay = this.continuousDataForm.value.endDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.continuousDataForm.value.endDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.continuousDataForm.value.endDate.year;
      let reqDateOfBirth = newDay + '/' + newMon + '/' + newYrs;
      return reqDateOfBirth;
    }
  }
  OnselectedDataHandlers(item: any) {
    this.selectedDataHandlers.push(item);

    this.dataHandlerIds = []
    this.selectedDataHandlers.forEach(obj => {
      let id = obj.id;
      this.dataHandlerIds.push(id);
    })
    let setOfDataHandlerIds = new Set(this.dataHandlerIds);
    this.uniqueDataHandlerIds = Array.from(setOfDataHandlerIds);

    this.ids = this.uniqueDataHandlerIds.join(",");
    this.getDhTagsByDHIds(this.ids);
  }
  OnItemDeSelectDataHandler(item: any) {
    this.selectedDataHandlers = this.selectedDataHandlers.filter(obj => obj !== item);
    this.dataHandlerIds = []
    this.selectedDataHandlers.forEach(obj => {
      let id = obj.id;
      this.dataHandlerIds.push(id);
    })
    let setOfDataHandlerIds = new Set(this.dataHandlerIds);
    this.uniqueDataHandlerIds = Array.from(setOfDataHandlerIds);

    this.ids = this.uniqueDataHandlerIds.join(",");
    if (this.ids) {
      this.getDhTagsByDHIds(this.ids);
    }
    else {
      this.isSelected = false;
      this.dataHandlerTagsList = [];
    }


  }
  onSelectAllDataHandlers(items: any) {
    this.selectedDataHandlers = items;
    this.dataHandlerIds = []
    this.selectedDataHandlers.forEach(obj => {
      let id = obj.id;
      this.dataHandlerIds.push(id);
    })
    let setOfDataHandlerIds = new Set(this.dataHandlerIds);
    this.uniqueDataHandlerIds = Array.from(setOfDataHandlerIds);

    this.ids = this.uniqueDataHandlerIds.join(",");
    this.getDhTagsByDHIds(this.ids);
  }
  onDeSelectAllDataHandlers(items: any) {
    this.selectedDataHandlers = [];
    this.isSelected = false;

    this.dataHandlerTagsList = [];


  }
  resetTags() {
    this.dataHandlerTagsList = [];
  }

  OnItemDeSelectGateWay(item: any) {
    this.selectedGateWayItems = this.selectedGateWayItems.filter(obj => obj !== item);
  }
  onSelectAllGateWay(items: any) {
    this.selectedGateWayItems = items;
  }
  onDeSelectAllGateWay(items: any) {
    this.selectedGateWayItems = [];
  }


  resetForm() {
    this.gatewayTemplateList = [];
    this.gateWayList = [];
    this.gateWayForMultiSelect = [];
    this.gatewayComm = [];
    this.dataHandlers = [];
    this.dataHandlersForMultiSelect = [];
    this.dataHandlerTagsList = [];
    this.selectedDataHandlers = [];
    this.registerForm();
    this.gatewayTemplates();
    this.getDataTypes();
    this.validateTime = false;
    this.validateEndTime = false;
    this.disableButton = false;

  }


  sendForm() {
    this.showLoaderImage = true;
    this.continuousData = <ContinuousData>this.continuousDataForm.value;
    let startDate = this.fetchStartDateFromPickerForApiCall();
    let startTime = this.continuousData.startTime
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
    let endDate = this.fetchEndDateFromPickerForApiCall();
    let endTime = this.continuousData.endTime
    if (endTime === 'endTime') {
      endTime = '';
    }
    if (endTime == null) {
      this.validTime = true;
      return null;
    }
    if (endTime.length == 0) {
      this.validTime = false;
      let endDateTdy = new Date();
      var year = endDateTdy.getFullYear();
      var month = endDateTdy.getMonth() + 1;
      let mth, d, totaldate;
      if (month <= 9) {
        mth = '0' + month;
      } else {
        mth = month
      }
      var day = endDateTdy.getDate();
      if (day <= 9) {
        d = '0' + day;
      } else {
        d = day;
      }
      totaldate = year + '-' + mth + '-' + d
      if (endDate !== totaldate) {
        endTime = '23:59:59';
      } else {
        var hours = endDateTdy.getHours();
        let hr;
        var minutes = endDateTdy.getMinutes();
        let min;
        if (hours <= 9) {
          hr = '0' + hours;
        } else {
          hr = hours
        }
        if (minutes <= 9) {
          min = '0' + minutes;
        } else {
          min = minutes;
        }
        let currentTime = hr + ":" + min + ":59";
        endTime = currentTime
      }
    }
    startDate = startDate + 'T' + startTime;
    endDate = endDate + 'T' + endTime;
    this.continuousData.startDate = startDate;
    this.continuousData.endDate = endDate;

    //this.continuousData= this.continuousDataForm.value;
    this.dataSimulatorService.sendContinuousDataForm(this.continuousData).subscribe((res) => {
      this.showLoaderImage = false;
      this.modelNotification.alertMessage('Success', 'Data simulator activated successfully');

      this.resetForm();

    },
      (error: any) => {

        this.showLoaderImage = false;
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, 'Failed to activate data simulator');
        this.resetForm();


      }
    );
  }

  redirect() {
    this.continuousDataForm.reset();
    this.registerForm();


  }
  changeStartDate(event: any) {
    this.validateStartAndEndTime('startTime');
  }
  changeEndDate(event: any) {
    this.validateStartAndEndTime('endTime');
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


}
