import { Aurelia, PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
  router: Router | undefined;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Aurelia CRUD';
    config.map([{
      route: [ '', 'home' ],
      name: 'home',
      moduleId: PLATFORM.moduleName('./home/home'),
      title: 'Home'
    }, {
      route: 'applicants-list',
      name: 'applicants',
      moduleId: PLATFORM.moduleName('./applicants/applicants'),
      title: 'Applicant List'
    }, {
      route: 'applicants-list/:id',
      name: 'ApplicantDetail',
      moduleId: PLATFORM.moduleName('./applicants/ApplicantDetail')
    }, {
      route: 'applicants-list/create',
      name: 'ApplicantCreate',
      moduleId: PLATFORM.moduleName('./applicants/ApplicantCreate')
    }]);

    this.router = router;
  }
}
