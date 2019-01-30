import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import List from '#rscv/List';
import {
    getColorOnBgColor,
    hexToRgb,
    rgbToHex,
    interpolateRgb,
} from '#rsu/common';

import SubdimensionRow from './SubdimensionRow';
import styles from './styles.scss';

const propTypes = {
    dimension: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    dimensionId: PropTypes.string.isRequired,
};

const defaultProps = {
    dimension: {},
};

export default class DimensionRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = subdimension => subdimension.id;

    getRowStyle = memoize(color => ({
        backgroundColor: color,
        color: getColorOnBgColor(color),
    }));

    getActiveCellStyle = memoize((rowStyle) => {
        const outlineWidth = 2;

        const stripeWidth = 4;
        const firstColor = rowStyle.backgroundColor;
        const secondColor = rgbToHex(interpolateRgb(
            hexToRgb(rowStyle.backgroundColor),
            hexToRgb(rowStyle.color),
            0.4,
        ));

        return {
            outline: `${outlineWidth}px solid ${firstColor}`,
            outlineOffset: `-${outlineWidth + 1}px`,
            background: `repeating-linear-gradient(
                -45deg,
                ${firstColor},
                ${firstColor} ${stripeWidth}px,
                ${secondColor} ${stripeWidth}px,
                ${secondColor} ${stripeWidth * 2}px
            )`,
        };
    });

    getHoverStyle = memoize(rowStyle => ({
        outline: `1px dashed ${rowStyle.color}`,
        outlineOffset: '-3px',
    }));

    rendererParams = (key, subdimension, i) => {
        const {
            dimension: {
                subdimensions,
                tooltip,
                title,
                color,
            },
            ...otherProps
        } = this.props;

        const isFirstSubdimension = i === 0;
        const children = isFirstSubdimension ? (
            <td
                rowSpan={subdimensions.length}
                className={styles.dimensionTd}
                title={tooltip}
            >
                {title}
            </td>
        ) : undefined;

        const rowStyle = this.getRowStyle(color);
        const activeCellStyle = this.getActiveCellStyle(rowStyle);
        const hoverStyle = this.getHoverStyle(rowStyle);

        return {
            subdimension,
            subdimensionId: key,

            children,
            rowStyle,
            activeCellStyle,
            hoverStyle,

            ...otherProps,
        };
    }

    render() {
        const { dimension: { subdimensions } } = this.props;
        return (
            <List
                data={subdimensions}
                keySelector={DimensionRow.keySelector}
                renderer={SubdimensionRow}
                rendererParams={this.rendererParams}
            />
        );
    }
}
