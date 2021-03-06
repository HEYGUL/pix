const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { validateEntity } = require('../validators/entity-validator');
const { states } = require('./Assessment');

const certificationAssessmentSchema = Joi.object({
  id: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
  certificationCourseId: Joi.number().integer().required(),
  createdAt: Joi.date().required(),
  completedAt: Joi.date().allow(null),
  state: Joi.string().valid(states.COMPLETED, states.STARTED, states.ABORTED).required(),
  isV2Certification: Joi.boolean().required(),
  certificationChallenges: Joi.array().min(1).required(),
  certificationAnswers: Joi.array().min(1).required(),
});

class CertificationAssessment {
  constructor({
    id,
    userId,
    certificationCourseId,
    createdAt,
    completedAt,
    state,
    isV2Certification,
    certificationChallenges,
    certificationAnswers,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.state = state;
    this.isV2Certification = isV2Certification;
    this.certificationChallenges = certificationChallenges;
    this.certificationAnswers = certificationAnswers;

    validateEntity(certificationAssessmentSchema, this);
  }
}

CertificationAssessment.states = states;

module.exports = CertificationAssessment;
