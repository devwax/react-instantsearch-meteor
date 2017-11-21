import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from './Link';
import classNames from './classNames.js';
import translatable from '../core/translatable';

const cx = classNames('Breadcrumb');

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })
);

class Breadcrumb extends Component {
  static propTypes = {
    canRefine: PropTypes.bool.isRequired,
    createURL: PropTypes.func.isRequired,
    items: itemsPropType,
    refine: PropTypes.func.isRequired,
    rootURL: PropTypes.string,
    separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    translate: PropTypes.func.isRequired,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(props) {
    if (this.context.canRefine) this.context.canRefine(props.canRefine);
  }

  render() {
    const {
      canRefine,
      createURL,
      items,
      refine,
      rootURL,
      separator,
      translate,
    } = this.props;
    const rootPath = canRefine ? (
      <span {...cx('item')}>
        <Link
          {...cx('itemLink', 'itemLinkRoot')}
          onClick={() => (!rootURL ? refine() : null)}
          href={rootURL ? rootURL : createURL()}
        >
          <span {...cx('rootLabel')}>{translate('rootLabel')}</span>
        </Link>
        <span {...cx('separator')}>{separator}</span>
      </span>
    ) : null;

    const breadcrumb = items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return !isLast ? (
        <span {...cx('item')} key={idx}>
          <Link
            {...cx('itemLink')}
            onClick={() => refine(item.value)}
            href={createURL(item.value)}
            key={idx}
          >
            <span {...cx('itemLabel')}>{item.label}</span>
          </Link>
          <span {...cx('separator')}>{isLast ? '' : separator}</span>
        </span>
      ) : (
        <span {...cx('itemLink', 'itemDisabled', 'item')} key={idx}>
          <span {...cx('itemLabel')}>{item.label}</span>
        </span>
      );
    });

    return (
      <div {...cx('root', !canRefine && 'noRefinement')}>
        {rootPath}
        {breadcrumb}
      </div>
    );
  }
}

export default translatable({
  rootLabel: 'Home',
})(Breadcrumb);
