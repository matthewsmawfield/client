import PropTypes from 'prop-types';
import React from 'react';
import { FaramGroup } from '@togglecorp/faram';

import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';

import styles from './styles.scss';

const deleteClick = (options, index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    return newOptions;
};

const SubdimensionRow = ({ index }) => (
    <div className={styles.subdimensionRow}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                className={styles.input}
                faramElementName="title"
                autoFocus
                label={_ts('widgets.editor.matrix2d', 'unnamedSubdimensionLabel', { index: index + 1 })}
            />
            <TextInput
                className={styles.input}
                faramElementName="tooltip"
                label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
            />
        </FaramGroup>
        <DangerButton
            faramElementName={index}
            faramAction={deleteClick}
            className={styles.deleteButton}
            iconName="delete"
            title={_ts('widgets.editor.matrix2d', 'removeSubdimensionButtonTooltip')}
            transparent
        />
    </div>
);

SubdimensionRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default SubdimensionRow;

