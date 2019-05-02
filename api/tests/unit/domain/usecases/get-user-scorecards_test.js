const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserScorecard = require('../../../../lib/domain/usecases/get-user-scorecards');

function assertScorecard(userScorecard, expectedUserScorecard) {
  expect(userScorecard.earnedPix).to.equal(expectedUserScorecard.earnedPix);
  expect(userScorecard.level).to.equal(expectedUserScorecard.level);
  expect(userScorecard.pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard.pixScoreAheadOfNextLevel);
  expect(userScorecard.status).to.equal(expectedUserScorecard.status);
}

describe('Unit | UseCase | get-user-scorecard', () => {

  let competenceRepository;
  let smartPlacementKnowledgeElementRepository;
  let competenceEvaluationRepository;

  beforeEach(() => {
    competenceRepository = { list: sinon.stub() };
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    competenceEvaluationRepository = { findByUserId: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  context('When user is authenticated', () => {
    const authenticatedUserId = 2;
    const earnedPixDefaultValue = 4;
    const maxLevel = 5;

    context('And user asks for his own scorecards', () => {
      const requestedUserId = 2;

      it('should resolve', () => {
        // given
        competenceRepository.list.resolves([]);
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([]);
        competenceEvaluationRepository.findByUserId.resolves([]);

        // when
        const promise = getUserScorecard({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository
        });

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should return related user scorecards', async () => {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const levelForCompetenceId2 = 0;
        const pixScoreAheadOfNextLevelForCompetenceId2 = 4;
        const competenceList = [
          domainBuilder.buildCompetence({ id: 1 }),
          domainBuilder.buildCompetence({ id: 2 }),
          domainBuilder.buildCompetence({ id: 3 })
        ];
        competenceRepository.list.resolves(competenceList);

        const assessmentFinishedOfCompetence1 = domainBuilder.buildAssessment({
          type: 'COMPETENCE_EVALUATION',
          state: 'completed'
        });

        const assessmentStartedOfCompetence2 = domainBuilder.buildAssessment({
          type: 'SMART_PLACEMENT',
          state: 'started'
        });
        const competenceEvaluationOfCompetence1 = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessment: assessmentFinishedOfCompetence1
        });

        const knowledgeElementList = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1, assessment: assessmentFinishedOfCompetence1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1, assessment: assessmentFinishedOfCompetence1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 2, assessment: assessmentStartedOfCompetence2 })
        ];

        const expectedUserScorecard = [
          domainBuilder.buildUserScorecard({
            courseId: competenceList[0].courseId,
            name: competenceList[0].name,
            earnedPix: earnedPixForCompetenceId1,
            level: levelForCompetenceId1,
            pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1,
            status: 'COMPLETED',
          }),

          domainBuilder.buildUserScorecard({
            courseId: competenceList[1].courseId,
            name: competenceList[1].name,
            earnedPix: earnedPixDefaultValue,
            level: levelForCompetenceId2,
            pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId2,
            status: 'STARTED',
          }),
          domainBuilder.buildUserScorecard({
            courseId: competenceList[2].courseId,
            name: competenceList[2].name,
            earnedPix: 0,
            level: 0,
            pixScoreAheadOfNextLevel: 0,
            status: 'NOT_STARTED',
          }),
        ];

        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);
        competenceEvaluationRepository.findByUserId.resolves([competenceEvaluationOfCompetence1]);

        // when
        const userScorecard = await getUserScorecard({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository
        });

        //then
        assertScorecard(userScorecard[0], expectedUserScorecard[0]);
        assertScorecard(userScorecard[1], expectedUserScorecard[1]);
        assertScorecard(userScorecard[2], expectedUserScorecard[2]);
      });

      it('should return the user scorecard with level limited to 5', async () => {
      // given
        const earnedPixNeededForLevelSixLimitedToFive = 50;
        const pixScoreAheadOfNextLevel = 2;

        const competenceList = [
          domainBuilder.buildCompetence({ id: 1 }),
        ];
        competenceRepository.list.resolves(competenceList);

        const knowledgeElementList = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1, earnedPix: earnedPixNeededForLevelSixLimitedToFive })
        ];
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

        const expectedUserScorecard = [
          domainBuilder.buildUserScorecard({
            competenceId: competenceList[0].id,
            name: competenceList[0].name,
            earnedPix: earnedPixNeededForLevelSixLimitedToFive,
            level: maxLevel,
            pixScoreAheadOfNextLevel,
          }),
        ];

        // when
        const userScorecard = await getUserScorecard({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository
        });

        //then
        assertScorecard(userScorecard[0], expectedUserScorecard[0]);
      });
    });

    context('And user asks for scorecards that do not belongs to him', () => {
      it('should reject a "UserNotAuthorizedToAccessEntity" domain error', () => {
        // given
        const requestedUserId = 34;

        competenceRepository.list.resolves([]);
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([]);

        // when
        const promise = getUserScorecard({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});