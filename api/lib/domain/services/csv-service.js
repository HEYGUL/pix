const _ = require('lodash');

const valueTypes = {
  TEXT: 'text',
  NUMBER: 'number',
};

function getCsvLine({ rawData, headerPropertyMap, headers, placeholder }) {
  const line = _.map(headers, () => placeholder);
  headerPropertyMap = sanitizeHeaderNames(headerPropertyMap);
  updateCsvLine({ line, rawData, headerPropertyMap });
  addDoubleQuotesToPlaceholders({ line, placeholder });
  return serializeLineWithPunctuationMarks(line);
}

function sanitizeHeaderNames(headerPropertyMap) {
  return _.map(headerPropertyMap, (item) => {
    item.headerName = removeDoubleQuotes(item.headerName);
    return item;
  });
}

function updateCsvLine({ line, rawData, headerPropertyMap }) {
  const headers =  _.map(headerPropertyMap, 'headerName');
  _.each(headerPropertyMap, (csvParams) => {
    line = updateCsvLineByProperty({ line, rawData, csvParams, headers });
  });
}

function updateCsvLineByProperty({ line, rawData, csvParams, headers }) {
  const { propertyName, headerName, type, value } = csvParams;

  // When the csv header to property map is dynaically generated, it is often
  // possible that the value is already known at the same moment. Therefore, the csv
  // service tries to look for such a pre-computed value first.
  const valueToInsert = value || rawData[propertyName];
  const typeToSelect = type || valueTypes.TEXT;

  if (typeToSelect === valueTypes.TEXT) {
    return addTextCell(headerName, valueToInsert, headers)(line);
  }
  if (typeToSelect === valueTypes.NUMBER) {
    return addNumberCell(headerName, valueToInsert, headers)(line);
  }
  throw new Error(`Missing value type: ${type} for property: ${propertyName}`);
}

function addNumberCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = toCsvNumber(data);
    return line;
  };
}

function addTextCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = toCsvText(data);
    return line;
  };
}

const _surroundWith = (outerString) => (innerString) => [outerString, innerString, outerString].join('');

function getHeadersWithQuotes(headers) {
  return _.map(headers, _surroundWith('"'));
}

function toCsvText(input) {
  return `"${input.toString().replace(/"/g, '""')}"`;
}

function toCsvNumber(input) {
  return input.toString().replace('.', ',');
}

function addDoubleQuotesToPlaceholders({ line, placeholder }) {
  _.each((line), (element, i) => {
    if (_.isEqual(element, placeholder)) {
      line[i] = _surroundWith('"')(placeholder);
    }
  });
}

function removeDoubleQuotes(text) {
  return `${text.replace(/"/g, '')}`;
}

// WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
// - https://en.wikipedia.org/wiki/Byte_order_mark
// - https://stackoverflow.com/a/38192870
function getHeadersLine(headers) {
  const BYTE_ORDER_MARK = '\uFEFF';
  return BYTE_ORDER_MARK + serializeLineWithPunctuationMarks(getHeadersWithQuotes(headers));
}

function serializeLineWithPunctuationMarks(line) {
  return line.join(';') + '\n';
}

module.exports = {
  getHeadersLine,
  getCsvLine,
  valueTypes,
};