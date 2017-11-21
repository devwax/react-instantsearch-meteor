'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _connectPagination = require('../connectors/connectPagination.js');

var _connectPagination2 = _interopRequireDefault(_connectPagination);

var _Pagination = require('../components/Pagination.js');

var _Pagination2 = _interopRequireDefault(_Pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The Pagination widget displays a simple pagination system allowing the user to
 * change the current page.
 * @name Pagination
 * @kind widget
 * @propType {boolean} [showFirst=true] - Display the first page link.
 * @propType {boolean} [showLast=false] - Display the last page link.
 * @propType {boolean} [showPrevious=true] - Display the previous page link.
 * @propType {boolean} [showNext=true] - Display the next page link.
 * @propType {number} [pagesPadding=3] - How many page links to display around the current page.
 * @propType {number} [maxPages=Infinity] - Maximum number of pages to display.
 * @themeKey ais-Pagination__root - The root component of the widget
 * @themeKey ais-Pagination__itemFirst - The first page link item
 * @themeKey ais-Pagination__itemPrevious - The previous page link item
 * @themeKey ais-Pagination__itemPage - The page link item
 * @themeKey ais-Pagination__itemNext - The next page link item
 * @themeKey ais-Pagination__itemLast - The last page link item
 * @themeKey ais-Pagination__itemDisabled - a disabled item
 * @themeKey ais-Pagination__itemSelected - a selected item
 * @themeKey ais-Pagination__itemLink - The link of an item
 * @themeKey ais-Pagination__noRefinement - present when there is no refinement
 * @translationKey previous - Label value for the previous page link
 * @translationKey next - Label value for the next page link
 * @translationKey first - Label value for the first page link
 * @translationKey last - Label value for the last page link
 * @translationkey page - Label value for a page item. You get function(currentRefinement) and you need to return a string
 * @translationKey ariaPrevious - Accessibility label value for the previous page link
 * @translationKey ariaNext - Accessibility label value for the next page link
 * @translationKey ariaFirst - Accessibility label value for the first page link
 * @translationKey ariaLast - Accessibility label value for the last page link
 * @translationkey ariaPage - Accessibility label value for a page item. You get function(currentRefinement) and you need to return a string
 * @example
 * import React from 'react';
 *
 * import { Pagination, InstantSearch } from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Pagination />
 *     </InstantSearch>
 *   );
 * }
 */
exports.default = (0, _connectPagination2.default)(_Pagination2.default);