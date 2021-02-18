import {autoinject} from 'aurelia-framework'
import {EventAggregator} from 'aurelia-event-aggregator'

import {ApplicantService} from "../services/services";
import {ApplicantUpdated, ApplicantViewed} from './messages'
import {areEqual} from './utility';

import { Router } from 'aurelia-router';
import { HttpClient } from 'aurelia-http-client';
import { validateTrigger, ValidationController, ValidationControllerFactory, ValidationRules, Validator } from 'aurelia-validation';

@autoinject
export class ApplicantDetail {
  private _applicantService: ApplicantService;
  event : any;
  router: Router;
  public canSave: Boolean;
  routeConfig : any;
  activeApplicant : any;
  originalApplicant : {};
  private controller: ValidationController;
  applicant = {
    name: '',
    familyName: '',
    emailAddress: '',
    address: '',
    countryOfOrigin: '',
    age: 0,
    hired: false
  };

  constructor(eventAggregator, applicantService: ApplicantService,private validator: Validator, controllerFactory: ValidationControllerFactory) {
    this.event = eventAggregator;
    this._applicantService = applicantService;
    this.canSave = false;
    this.controller = controllerFactory.createForCurrentScope(validator);
    this.controller.validateTrigger = validateTrigger.changeOrBlur;
    this.controller.subscribe(event => this.validateWhole());
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;
    return this._applicantService.getApplicant(params.id)
      .then(applicant => {
        debugger;
        this.activeApplicant = applicant;
        this.routeConfig.navModel.setTitle(this.activeApplicant.name);
        this.originalApplicant = applicant;
        this.event.publish(new ApplicantViewed(this.activeApplicant));
        this.setupValidation();
      });
    }
    public setupValidation() {
      if (this.applicant) {
        ValidationRules
          .ensure('name').required().minLength(5).withMessage('name must at least be 5 chars long.')
          .ensure('familyName').required().minLength(5).withMessage('familyName must at least be 5 chars long.')
          .ensure('address').required().minLength(10).withMessage('address must at least be 10 chars long.')
          .ensure('emailAddress').required().email().withMessage('emailAddress must be a valid mail.')
          .ensure('age').required().range(20,60).withMessage('familyName must at least be 5 chars long.')
          .ensure('countryOfOrigin').required().satisfies(this.validCountry).withMessage('countryOfOrigin must be a valid country.')
          .on(this.applicant);
      }
    }
  
   validCountry(country):boolean{
     var validity =true;
    //  var country="";
     if (country!='') {
      // country=this.applicant.countryOfOrigin;
      let httpClient = new HttpClient();
      debugger;
     httpClient.get('https://restcountries.eu/rest/v2/name/'+country+"?fullText=true")
       .then(data => {
       
        if (data.isSuccess) {
          console.log(data.response);
           validity=true;
         }
       }).catch(err =>{
         console.log(err);
         return false
       });
     }  
  return validity
  }

  private validateWhole() {
    this.validator.validateObject(this.applicant)
        .then(results => this.canSave = results.every(result => result.valid));
}

  save() {
    this._applicantService.updateClient(this.activeApplicant.id, this.activeApplicant).then(applicant => {
      this.activeApplicant = applicant
      this.routeConfig.navModel.setTitle(this.activeApplicant.name);
      this.originalApplicant = applicant;
      this.event.publish(new ApplicantUpdated(this.activeApplicant));
      window.history.back();
    });
  }

  canDeactivate() {
    if(!areEqual(this.originalApplicant, this.activeApplicant)){
      let result = confirm('You have unsaved changes. Are you sure you wish to leave?');
      if(!result) {
        this.event.publish(new ApplicantViewed(this.activeApplicant));
      }
      return result;
    }
    return true;
  }
}
