const { expect, databaseBuilder } = require('../../../test-helper');

const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const Membership = require('../../../../lib/domain/models/Membership');

const updateMembershipAttributes = require('../../../../lib/domain/usecases/update-membership-attributes');

describe('Integration | UseCases | update-membership-attributes', () => {

  let userId;
  let organizationId;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  it('should update membership attributes', async () => {
    // given
    const membershipId = databaseBuilder.factory.buildMembership({
      organizationId, userId,
      organizationRole: Membership.roles.MEMBER
    }).id;
    const newOrganizationRole = Membership.roles.ADMIN;
    const updatedByUserId = '12345';
    const membershipAttributes = { organizationRole: newOrganizationRole, updatedByUserId };

    await databaseBuilder.commit();

    // when
    const result = await updateMembershipAttributes({ membershipRepository, membershipId, membershipAttributes });

    // then
    expect(result).to.be.an.instanceOf(Membership);
    expect(result.organizationRole).equal(newOrganizationRole);
    expect(result.updatedByUserId).equal(updatedByUserId);
  });

});
