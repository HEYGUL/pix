
module.exports = async function updateMembershipAttributes({ membershipRepository, membershipId, membershipAttributes }) {
  const membershipUpdated = await membershipRepository.updateById({ id: membershipId, membershipAttributes });
  return membershipUpdated;
};
