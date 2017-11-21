import PropTypes from 'prop-types';
import {
  cleanUpValue,
  getIndex,
  refineValue,
  getCurrentRefinementValue,
  getResults,
} from '../core/indexUtils';

import createConnector from '../core/createConnector';

const namespace = 'refinementList';

function getId(props) {
  return props.attributeName;
}

function getCurrentRefinement(props, searchState, context) {
  return getCurrentRefinementValue(
    props,
    searchState,
    context,
    `${namespace}.${getId(props)}`,
    [],
    currentRefinement => {
      if (typeof currentRefinement === 'string') {
        // All items were unselected
        if (currentRefinement === '') {
          return [];
        }

        // Only one item was in the searchState but we know it should be an array
        return [currentRefinement];
      }
      return currentRefinement;
    }
  );
}

function getValue(name, props, searchState, context) {
  const currentRefinement = getCurrentRefinement(props, searchState, context);
  const isAnewValue = currentRefinement.indexOf(name) === -1;
  const nextRefinement = isAnewValue
    ? currentRefinement.concat([name]) // cannot use .push(), it mutates
    : currentRefinement.filter(selectedValue => selectedValue !== name); // cannot use .splice(), it mutates
  return nextRefinement;
}

function refine(props, searchState, nextRefinement, context) {
  const id = getId(props);
  // Setting the value to an empty string ensures that it is persisted in
  // the URL as an empty value.
  // This is necessary in the case where `defaultRefinement` contains one
  // item and we try to deselect it. `nextSelected` would be an empty array,
  // which would not be persisted to the URL.
  // {foo: ['bar']} => "foo[0]=bar"
  // {foo: []} => ""
  const nextValue = { [id]: nextRefinement.length > 0 ? nextRefinement : '' };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage, namespace);
}

function cleanUp(props, searchState, context) {
  return cleanUpValue(searchState, context, `${namespace}.${getId(props)}`);
}
/**
 * connectRefinementList connector provides the logic to build a widget that will
 * give the user the ability to choose multiple values for a specific facet.
 * @name connectRefinementList
 * @kind connector
 * @requirements The attribute passed to the `attributeName` prop must be present in "attributes for faceting"
 * on the Algolia dashboard or configured as `attributesForFaceting` via a set settings call to the Algolia API.
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {boolean} [withSearchBox=false] - allow search inside values
 * @propType {string} [operator=or] - How to apply the refinements. Possible values: 'or' or 'and'.
 * @propType {boolean} [showMore=false] - true if the component should display a button that will expand the number of items
 * @propType {number} [limitMin=10] - the minimum number of displayed items
 * @propType {number} [limitMax=20] - the maximun number of displayed items. Only used when showMore is set to `true`
 * @propType {string[]} defaultRefinement - the values of the items selected by default. The searchState of this widget takes the form of a list of `string`s, which correspond to the values of all selected refinements. However, when there are no refinements selected, the value of the searchState is an empty string.
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string[]} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{count: number, isRefined: boolean, label: string, value: string}>} items - the list of items the RefinementList can display.
 * @providedPropType {function} searchForItems - a function to toggle a search inside items values
 * @providedPropType {boolean} isFromSearch - a boolean that says if the `items` props contains facet values from the global search or from the search inside items.
 */

const sortBy = ['isRefined', 'count:desc', 'name:asc'];
export default createConnector({
  displayName: 'AlgoliaRefinementList',

  propTypes: {
    id: PropTypes.string,
    attributeName: PropTypes.string.isRequired,
    operator: PropTypes.oneOf(['and', 'or']),
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    defaultRefinement: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    withSearchBox: PropTypes.bool,
    searchForFacetValues: PropTypes.bool, // @deprecated
    transformItems: PropTypes.func,
  },

  defaultProps: {
    operator: 'or',
    showMore: false,
    limitMin: 10,
    limitMax: 20,
  },

  getProvidedProps(
    props,
    searchState,
    searchResults,
    metadata,
    searchForFacetValuesResults
  ) {
    const { attributeName, showMore, limitMin, limitMax } = props;
    const limit = showMore ? limitMax : limitMin;
    const results = getResults(searchResults, this.context);

    const canRefine =
      Boolean(results) && Boolean(results.getFacetByName(attributeName));

    const isFromSearch = Boolean(
      searchForFacetValuesResults &&
        searchForFacetValuesResults[attributeName] &&
        searchForFacetValuesResults.query !== ''
    );
    const withSearchBox = props.withSearchBox || props.searchForFacetValues;
    if (process.env.NODE_ENV === 'development' && props.searchForFacetValues) {
      // eslint-disable-next-line no-console
      console.warn(
        'react-instantsearch: `searchForFacetValues` has been renamed to' +
          '`withSearchBox`, this will break in the next major version.'
      );
    }
    // Search For Facet Values is not available with derived helper (used for multi index search)
    if (props.withSearchBox && this.context.multiIndexContext) {
      throw new Error(
        'react-instantsearch: searching in *List is not available when used inside a' +
          ' multi index context'
      );
    }

    if (!canRefine) {
      return {
        items: [],
        currentRefinement: getCurrentRefinement(
          props,
          searchState,
          this.context
        ),
        canRefine,
        isFromSearch,
        withSearchBox,
      };
    }

    const items = isFromSearch
      ? searchForFacetValuesResults[attributeName].map(v => ({
          label: v.value,
          value: getValue(v.value, props, searchState, this.context),
          _highlightResult: { label: { value: v.highlighted } },
          count: v.count,
          isRefined: v.isRefined,
        }))
      : results.getFacetValues(attributeName, { sortBy }).map(v => ({
          label: v.name,
          value: getValue(v.name, props, searchState, this.context),
          count: v.count,
          isRefined: v.isRefined,
        }));

    const transformedItems = props.transformItems
      ? props.transformItems(items)
      : items;

    return {
      items: transformedItems.slice(0, limit),
      currentRefinement: getCurrentRefinement(props, searchState, this.context),
      isFromSearch,
      withSearchBox,
      canRefine: items.length > 0,
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, this.context);
  },

  searchForFacetValues(props, searchState, nextRefinement) {
    return { facetName: props.attributeName, query: nextRefinement };
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, this.context);
  },

  getSearchParameters(searchParameters, props, searchState) {
    const { attributeName, operator, showMore, limitMin, limitMax } = props;
    const limit = showMore ? limitMax : limitMin;

    const addKey = operator === 'and' ? 'addFacet' : 'addDisjunctiveFacet';
    const addRefinementKey = `${addKey}Refinement`;

    searchParameters = searchParameters.setQueryParameters({
      maxValuesPerFacet: Math.max(
        searchParameters.maxValuesPerFacet || 0,
        limit
      ),
    });

    searchParameters = searchParameters[addKey](attributeName);

    return getCurrentRefinement(props, searchState, this.context).reduce(
      (res, val) => res[addRefinementKey](attributeName, val),
      searchParameters
    );
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    const context = this.context;
    return {
      id,
      index: getIndex(this.context),
      items:
        getCurrentRefinement(props, searchState, context).length > 0
          ? [
              {
                attributeName: props.attributeName,
                label: `${props.attributeName}: `,
                currentRefinement: getCurrentRefinement(
                  props,
                  searchState,
                  context
                ),
                value: nextState => refine(props, nextState, [], context),
                items: getCurrentRefinement(props, searchState, context).map(
                  item => ({
                    label: `${item}`,
                    value: nextState => {
                      const nextSelectedItems = getCurrentRefinement(
                        props,
                        nextState,
                        context
                      ).filter(other => other !== item);
                      return refine(
                        props,
                        searchState,
                        nextSelectedItems,
                        context
                      );
                    },
                  })
                ),
              },
            ]
          : [],
    };
  },
});
