const faker = require('faker');
const databaseBuffer = require('../database-buffer');

const buildOrganization = function buildOrganization({
  id,
  type = 'PRO',
  name = faker.company.companyName(),
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = faker.lorem.word().toUpperCase(),
  provinceCode = faker.random.alphaNumeric(3),
  isManagingStudents = false,
  credit = 500,
  canCollectProfiles = false,
  createdAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
} = {}) {

  const values = {
    id,
    type,
    name,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit,
    canCollectProfiles,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

module.exports = buildOrganization;
