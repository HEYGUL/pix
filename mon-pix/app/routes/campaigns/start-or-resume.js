import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

import { isEmpty } from '@ember/utils';

@classic
export default class StartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  campaignCode = null;
  campaign = null;
  associationDone = false;
  campaignIsRestricted = false;
  givenParticipantExternalId = null;
  userHasSeenLanding = false;
  userHasJustConsultedTutorial = false;
  campaignParticipationIsStarted = false;
  authenticationRoute = 'inscription';
  _isReady = false;

  beforeModel(transition) {
    this.set('_isReady', false);
    this.set('campaignCode', transition.to.parent.params.campaign_code);
    this.set('associationDone', transition.to.queryParams.associationDone);
    this.set('campaignIsRestricted', transition.to.queryParams.campaignIsRestricted);
    this.set('givenParticipantExternalId', this.givenParticipantExternalId || transition.to.queryParams.participantExternalId);
    this.set('userHasSeenLanding', transition.to.queryParams.hasSeenLanding);
    this.set('userHasJustConsultedTutorial', transition.to.queryParams.hasJustConsultedTutorial);
    this.set('campaignParticipationIsStarted', transition.to.queryParams.campaignParticipationIsStarted);

    if (this._userIsUnauthenticated() && !this.userHasSeenLanding && this.campaignIsRestricted) {
      this.set('authenticationRoute', 'campaigns.login-or-register-to-access-restricted-campaign');
      this.transitionTo('campaigns.login-or-register-to-access-restricted-campaign',this.campaignCode);
    }
    if (this._userIsUnauthenticated() && !this.userHasSeenLanding && !this.campaignIsRestricted) {
      return this.replaceWith('campaigns.campaign-landing-page', this.campaignCode, { queryParams: transition.to.queryParams });
    }
    super.beforeModel(...arguments);
  }

  async model() {
    this.set('isLoading', true);
    const campaigns = await this.store.query('campaign', { filter: { code: this.campaignCode } });

    return campaigns.get('firstObject');
  }

  async redirect(campaign) {

    if (campaign.isArchived) {
      this.set('isLoading', false);
      return this.set('_isReady', true);
    }

    const smartPlacementAssessments = await this.store.query(
      'assessment',
      { filter: { type: 'SMART_PLACEMENT', codeCampaign: this.campaignCode } },
    );
    this.set('_isReady', true);

    if (this._thereIsNoAssessment(smartPlacementAssessments)) {

      if (campaign.isTypeProfilesCollection && this.campaignParticipationIsStarted) {
        return this.replaceWith('profiles-collection-campaigns.send-profile', this.campaignCode);
      }
      if (this.userHasSeenLanding) {
        return this.replaceWith('campaigns.fill-in-id-pix', this.campaignCode, { queryParams: { givenParticipantExternalId: this.givenParticipantExternalId } });
      }
      if (!campaign.isRestricted || this.associationDone) {
        return this.replaceWith('campaigns.campaign-landing-page', this.campaignCode, { queryParams: { givenParticipantExternalId: this.givenParticipantExternalId } });
      }
      return this.replaceWith('campaigns.join-restricted-campaign', this.campaignCode, { queryParams: { givenParticipantExternalId: this.givenParticipantExternalId } });
    }

    const assessment = await smartPlacementAssessments.get('firstObject').reload();

    if (this._showTutorial(assessment)) {
      return this.replaceWith('assessment-campaigns.tutorial', this.campaignCode);
    }

    return this.replaceWith('assessments.resume', assessment.get('id'));
  }

  _userIsUnauthenticated() {
    return this.session.isAuthenticated === false;
  }

  _thereIsNoAssessment(assessments) {
    return isEmpty(assessments);
  }

  _showTutorial(assessment) {
    return (
      !this.userHasJustConsultedTutorial
      && assessment.answers.length === 0
      && !assessment.isCompleted
      && !this.currentUser.user.hasSeenAssessmentInstructions
    );
  }

  @action
  loading() {
    return this._isReady;
  }
}
