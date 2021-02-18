import { HttpClient } from "aurelia-http-client";
import { inject } from "aurelia-framework";

import api from '../config/api';

@inject(HttpClient)
export class ApplicantService {
  private http:HttpClient;
  applicants = [];

  constructor(http:HttpClient) {
    http.configure(x => x.withBaseUrl(api.dev + '/api/applicants/'));
    this.http = http;
  }

  getApplicants() {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get('')
        .then(data => {
          this.applicants = JSON.parse(data.response);
          resolve(this.applicants)
        }).catch(err => reject(err));
    });
    return promise;
  }

  createApplicant(applicant) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post('', applicant)
        .then(data => {
          let newApplicant = JSON.parse(data.response);
          resolve(newApplicant);
        }).catch(err => reject(err));
    });
    return promise;
  }

  getApplicant(id) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(id)
        .then(response => {
          let applicant = JSON.parse(response.response);
          resolve(applicant);
        }).catch(err => reject(err))
    });
    return promise;
  }

  deleteApplicant(id) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .delete(id)
        .then(response => {
          let result = JSON.parse(response.response);
          resolve(result);
        })
        .catch(err => reject(err));
    });
    return promise;
  }

  updateClient(id, applicant) {
    var idStr=JSON.stringify(id);
    debugger;
    let promise = new Promise((resolve, reject) => {
      this.http
        .put(idStr, applicant)
        .then(response => {
          let applicant = JSON.parse(response.response);
          resolve(applicant);
        }).catch(err => reject(err));
    });
    return promise;
  }
}
