import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramElement from '#rsci/Faram/FaramElement';

import { iconNames } from '#constants';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    setSelectedRow: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
};
const defaultProps = {
    data: {},
    isSelected: false,
    hasError: false,
};

@FaramElement('errorIndicator')
export default class RowTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const { data } = this.props;
        const key = this.props.keyExtractor(data);
        this.props.setSelectedRow(key);
    }

    faramInfoForDelete = {
        callback: (i, newValue) => {
            const newIndex = Math.min(i, newValue.length - 1);
            const newKey = newIndex !== -1
                ? this.props.keyExtractor(newValue[newIndex])
                : undefined;
            this.props.setSelectedRow(newKey);
        },
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
        } = this.props;

        const rowTitleClassNames = [styles.rowTitle];
        const titleClassNames = [styles.title];
        if (isSelected) {
            rowTitleClassNames.push(styles.active);
        }
        if (hasError) {
            titleClassNames.push(styles.hasError);
        }

        const defaultTitle = `Row ${index + 1}`;

        return (
            <div className={rowTitleClassNames.join(' ')}>
                <button
                    className={titleClassNames.join(' ')}
                    onClick={this.handleClick}
                    type="button"
                >
                    {title || defaultTitle}
                </button>
                <DangerButton
                    className={styles.deleteButton}
                    // FIXME: use strings
                    title="Remove Row"
                    iconName={iconNames.delete}
                    transparent
                    faramAction="remove"
                    faramInfo={this.faramInfoForDelete}
                    faramElementIndex={index}
                />
            </div>
        );
    }
}
