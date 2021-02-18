import {ApplicantViewed, ApplicantUpdated, ApplicantDeleted, ApplicantCreated} from './messages'
import {ApplicantService} from "../services/services";

import {EventAggregator} from 'aurelia-event-aggregator'
import {inject} from 'aurelia-framework'

@inject(EventAggregator, ApplicantService)
export class ApplicantList {
  private _applicantService: ApplicantService;
  ea : any;
  applicants : [] | any;
  selectedId : number;

  constructor(ea: EventAggregator, applicantService: ApplicantService){
    this.ea = ea;
    this.applicants = [];
    this._applicantService = applicantService;

    ea.subscribe(ApplicantViewed, msg => this.select(msg.applicant));
    ea.subscribe(ApplicantUpdated, msg => {
      let id = msg.applicant.id;
      let found = this.applicants.find(x => x.id === id);
      Object.assign(found, msg.applicant);
    });
    ea.subscribe(ApplicantDeleted, msg => {
      let deletedApplicant = msg.applicant;
      this.applicants = this.applicants.filter(applicant => applicant !== deletedApplicant);
    });
    ea.subscribe(ApplicantCreated, msg => {
      let applicant = msg.applicant;
      this.applicants.push(applicant);
    });
  }

  created() {
    this._applicantService.getApplicants()
      .then(data => this.applicants = data)
      .catch(err => console.log(err));
  }

  select(applicant) {
    this.selectedId = applicant.id;
    return true;
  }

  remove(applicant) {
    if(confirm('Are you sure that you want to delete this applicant?')) {
      this._applicantService
        .deleteApplicant(applicant.id)
        .then(reponse => {
            this.ea.publish(new ApplicantDeleted(applicant))
        })
        .catch(err => console.log(err));
    }
  }
}
