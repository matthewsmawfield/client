import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import { FaramInputElement } from '#rscg/FaramElements';
import update from '#rsu/immutable-update';
import {
    getColorOnBgColor,
    hexToRgb,
    rgbToHex,
    interpolateRgb,
} from '#rsu/common';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    options: [],
    value: undefined,
    disabled: false,
    readOnly: false,
    onChange: () => {},
};

@FaramInputElement
export default class Matrix1dInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    getCellStyle = memoize(color => ({
        backgroundColor: color,
        color: getColorOnBgColor(color),
        border: `2px solid ${color}`,
    }));

    getActiveCellStyle = memoize((rowStyle) => {
        const outlineColor = rgbToHex(interpolateRgb(
            hexToRgb(rowStyle.backgroundColor),
            hexToRgb(rowStyle.color),
            0.5,
        ));

        return {
            backgroundColor: rowStyle.backgroundColor,
            color: rowStyle.color,
            outline: `2px dashed ${outlineColor}`,
            outlineOffset: '-3px',
            border: `2px solid ${rowStyle.backgroundColor}`,

            /*
            color: rowStyle.color,
            outline: `${outlineWidth}px solid ${borderColor}`,
            outlineOffset: `-${outlineWidth}px`,
            background: `repeating-linear-gradient(
                -45deg,
                ${firstColor},
                ${firstColor} ${stripeWidth}px,
                ${secondColor} ${stripeWidth}px,
                ${secondColor} ${stripeWidth * 2}px
            )`,
            */
            /*
            textShadow: `
                -1px -1px 0 ${shadowColor},
                 0   -1px 0 ${shadowColor},
                 1px -1px 0 ${shadowColor},
                 1px  0   0 ${shadowColor},
                 1px  1px 0 ${shadowColor},
                 0    1px 0 ${shadowColor},
                -1px  1px 0 ${shadowColor},
                -1px  0   0 ${shadowColor}`,
            */
        };
    });

    getHoverStyle = memoize(rowStyle => ({
        outline: `1px dashed ${rowStyle.color}`,
        outlineOffset: '-3px',
    }));

    handleCellClick = (key, cellKey) => {
        const { value } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: { $apply: item => !item },
            } },
        } };

        const newValue = update(value, settings);
        this.props.onChange(newValue);
    }

    handleCellDrop = (key, cellKey, droppedData) => {
        const { type, data } = droppedData;
        this.props.onChange(
            undefined,
            {
                action: 'newEntry',
                excerptType: type,
                excerptValue: data,
                value: {
                    [key]: {
                        [cellKey]: true,
                    },
                },
            },
        );
    }

    rendererParams = (key, row) => {
        const rowStyle = this.getCellStyle(row.color);
        const activeCellStyle = this.getActiveCellStyle(rowStyle);
        const hoverStyle = this.getHoverStyle(rowStyle);

        return {
            title: row.title,
            tooltip: row.tooltip,
            cells: row.cells,
            // FIXME: send rowKey and cellKey as props
            onCellClick: cellKey => this.handleCellClick(key, cellKey),
            onCellDrop: (cellKey, droppedData) => this.handleCellDrop(key, cellKey, droppedData),
            selectedCells: this.props.value ? this.props.value[key] : undefined,
            disabled: this.props.disabled,
            readOnly: this.props.readOnly,

            rowStyle,
            activeCellStyle,
            hoverStyle,
        };
    }

    render() {
        const {
            options,
            className,
        } = this.props;

        console.warn(options);

        return (
            <ListView
                className={`${styles.overview} ${className}`}
                data={options}
                keySelector={Matrix1dInput.rowKeyExtractor}
                renderer={Row}
                rendererParams={this.rendererParams}
                emptyComponent={null}
            />
        );
    }
}
