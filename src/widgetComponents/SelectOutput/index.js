import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.string, // eslint-disable-line react/forbid-prop-types
    labelSelector: PropTypes.func,
    keySelector: PropTypes.func,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    options: [],
    value: '',
    labelSelector: v => v.label,
    keySelector: v => v.key,
};

export default class SelectOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSelection = (options, value, keySelector) => (
        options.find(o => value === keySelector(o))
    )

    constructor(props) {
        super(props);
        const {
            options,
            value,
            keySelector,
        } = props;

        this.selection = SelectOutput.getSelection(
            options,
            value,
            keySelector,
        );
    }

    componentWillReceiveProps(nextProps) {
        const {
            options: newOptions,
            value: newValue,
            keySelector,
        } = nextProps;

        const {
            options: oldOptions,
            value: oldValue,
        } = this.props;

        if (oldOptions !== newOptions || newValue !== oldValue) {
            this.selection = SelectOutput.getSelection(
                newOptions,
                newValue,
                keySelector,
            );
        }
    }

    render() {
        const {
            className,
            labelSelector,
        } = this.props;

        const emptyText = '-';

        return (
            <span className={`${className} ${styles.selectOutput}`} >
                {this.selection ? (
                    labelSelector(this.selection)
                ) : (
                    <span className={className}>
                        {emptyText}
                    </span>
                )}
            </span>
        );
    }
}