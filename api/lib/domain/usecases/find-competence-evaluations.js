const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCompetenceEvaluations({
  userId,
  options,
  competenceEvaluationRepository,
  campaignAssessmentRepository,
}) {
  if (!(await campaignAssessmentRepository.doesAssessmentBelongToUser(options.filter.assessmentId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this competence evaluation');
  }

  return competenceEvaluationRepository.find(options);
};
