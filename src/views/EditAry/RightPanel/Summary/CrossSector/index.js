import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class CrossSector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'cross-sector',
            styles.crossSector,
        ];

        return classNames.join(' ');
    }

    render() {
        const className = this.getClassName();

        return (
            <div className={className}>
                Cross sector
            </div>
        );
    }
}