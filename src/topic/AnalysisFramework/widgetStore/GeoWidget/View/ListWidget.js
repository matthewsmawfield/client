import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class GeoViewList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            attribute: {
                values = [],
            } = {},
        } = this.props;

        return (
            <div styleName="geo-list">
                {values.map(val => <span key={val.key}>{val.title}</span>)}
            </div>
        );
    }
}