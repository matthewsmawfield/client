import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { afStringsSelector } from '../../../../../redux';
import BoundError from '../../../../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
@CSSModules(styles)
export default class Matrix2dList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div styleName="matrix-two-container">
                {this.props.afStrings('matrix2DWidgetLabel')}
            </div>
        );
    }
}