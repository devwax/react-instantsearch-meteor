'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _indexUtils = require('../core/indexUtils');

var _createConnector = require('../core/createConnector');

var _createConnector2 = _interopRequireDefault(_createConnector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getId() {
  return 'sortBy';
}

function getCurrentRefinement(props, searchState, context) {
  var id = getId(props);
  return (0, _indexUtils.getCurrentRefinementValue)(props, searchState, context, id, null, function (currentRefinement) {
    if (currentRefinement) {
      return currentRefinement;
    }
    return null;
  });
}

/**
 * The connectSortBy connector provides the logic to build a widget that will
 *  display a list of indices. This allows a user to change how the hits are being sorted.
 * @name connectSortBy
 * @requirements Algolia handles sorting by creating replica indices. [Read more about sorting](https://www.algolia.com/doc/guides/relevance/sorting/) on
 * the Algolia website.
 * @kind connector
 * @propType {string} defaultRefinement - The default selected index.
 * @propType {{value: string, label: string}[]} items - The list of indexes to search in.
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string[]} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{isRefined: boolean, label?: string, value: string}>} items - the list of items the HitsPerPage can display.  If no label provided, the value will be displayed.
 */
exports.default = (0, _createConnector2.default)({
  displayName: 'AlgoliaSortBy',

  propTypes: {
    defaultRefinement: _propTypes2.default.string,
    items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
      label: _propTypes2.default.string,
      value: _propTypes2.default.string.isRequired
    })).isRequired,
    transformItems: _propTypes2.default.func
  },

  getProvidedProps: function getProvidedProps(props, searchState) {
    var currentRefinement = getCurrentRefinement(props, searchState, this.context);
    var items = props.items.map(function (item) {
      return item.value === currentRefinement ? _extends({}, item, { isRefined: true }) : _extends({}, item, { isRefined: false });
    });
    return {
      items: props.transformItems ? props.transformItems(items) : items,
      currentRefinement: currentRefinement
    };
  },
  refine: function refine(props, searchState, nextRefinement) {
    var id = getId();
    var nextValue = _defineProperty({}, id, nextRefinement);
    var resetPage = true;
    return (0, _indexUtils.refineValue)(searchState, nextValue, this.context, resetPage);
  },
  cleanUp: function cleanUp(props, searchState) {
    return (0, _indexUtils.cleanUpValue)(searchState, this.context, getId());
  },
  getSearchParameters: function getSearchParameters(searchParameters, props, searchState) {
    var selectedIndex = getCurrentRefinement(props, searchState, this.context);
    return searchParameters.setIndex(selectedIndex);
  },
  getMetadata: function getMetadata() {
    return { id: getId() };
  }
});