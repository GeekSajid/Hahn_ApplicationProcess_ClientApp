import {autoinject , reset} from 'aurelia-framework';
import {EventAggregator} from "aurelia-event-aggregator";
import { Validator,ValidationController,ValidationControllerFactory,validateTrigger, ValidationRules, validationMessages } from 'aurelia-validation';

import {ApplicantCreated} from './messages'
import {ApplicantService} from '../services/services';

import { Router } from 'aurelia-router';
import { HttpClient } from 'aurelia-http-client';

@autoinject 
export class ApplicantCreate {
  private _applicantService;
  private _ea;
  public canSave: Boolean;
  public canReset: Boolean;
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
  router: Router;

  constructor(ea: EventAggregator, applicantService: ApplicantService, router: Router,private validator: Validator, controllerFactory: ValidationControllerFactory) {
    this._applicantService = applicantService;
    this.canSave = false;
    this.canReset = false;
    this.controller = controllerFactory.createForCurrentScope(validator);
    this.controller.validateTrigger = validateTrigger.changeOrBlur;
    this.controller.subscribe(event => this.validateWhole());
    this._ea = ea;
    this.router = router;
    
  }

  private validateWhole() {
    this.validator.validateObject(this.applicant)
        .then(results => this.canSave = results.every(result => result.valid));
}
public checkInputs(){
  debugger;
  if (this.applicant)
  {
    if (this.applicant.name||this.applicant.familyName||this.applicant.emailAddress||this.applicant.countryOfOrigin||this.applicant.address) {
      this.canReset = true;
    }
  }
}
  create() {
    let applicant = JSON.parse(JSON.stringify(this.applicant));
    //this.validCountry(this.applicant.countryOfOrigin);
    if(!this.canSave) {
      return alert("You need to add valid information to your applicant.");
    } else {
      this._applicantService.createApplicant(applicant)
      .then(applicant => {
          this._ea.publish(new ApplicantCreated(applicant));
      }).catch(err => console.log(err));
    this.router.navigateToRoute('applicants');
    }
  }
public activate(params) {
  this.setupValidation();
  this.checkInputs();
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
  
  reset() {
    var resetConfirmed = false;

    resetConfirmed = confirm('Are you sure you want to reset all data?');
    if (resetConfirmed) {
      window.location.reload();
    }
    
  }
}
