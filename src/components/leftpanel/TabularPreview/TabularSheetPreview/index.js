import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import Field from './Field';

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        data: PropTypes.array,
        options: PropTypes.object,
    }),
    onClick: PropTypes.func.isRequired,
    highlights: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    sheet: {},
    highlights: {},
};

export default class TabularSheetPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = d => d.id;

    static calcFieldsData = memoize(({ fields, data = [] }) => fields.map(field => ({
        ...field,
        data: data.map(d => ({
            key: d.key,
            value: d[field.id].value,
            type: d[field.id].type,
        })),
    })));

    renderParams = (key, field) => ({
        fieldId: field.id,
        title: field.title,
        type: field.type,
        options: field.options,
        data: field.data,
        geodata: field.geodata,
        color: (this.props.highlights[field.id] || {}).color,
        leadKey: (this.props.highlights[field.id] || {}).key,
        onClick: this.props.onClick,
    })

    render() {
        const {
            className,
            sheet,
        } = this.props;
        return (
            <ListView
                className={className}
                keySelector={TabularSheetPreview.keySelector}
                rendererParams={this.renderParams}
                data={TabularSheetPreview.calcFieldsData(sheet)}
                renderer={Field}
            />
        );
    }
}