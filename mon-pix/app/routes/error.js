import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  session: service(),

  setupController(controller, error) {
    this._super(...arguments);
    controller.set('errorMessage', error);

    if (error.errors && error.errors[0]) {
      const apiError = error.errors[0];
      controller.setProperties({
        'errorDetail': apiError.detail,
        'errorStatus': apiError.status,
        'errorTitle': apiError.title
      });
    } else {
      controller.setProperties({ 'errorDetail': null, 'errorStatus': null, 'errorTitle': null });
    }
  }

});
