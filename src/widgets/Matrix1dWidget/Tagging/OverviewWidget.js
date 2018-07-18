import React from 'react';
import PropTypes from 'prop-types';

import BoundError from '#rs/components/General/BoundError';
import ListView from '#rs/components/View/List/ListView';
import update from '#rs/utils/immutable-update';

import WidgetError from '#components/WidgetError';

import MatrixRow from './MatrixRow';
import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    attribute: undefined,
};

@BoundError(WidgetError)
export default class Matrix1dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const data = this.props.data || { rows: [] };
        this.state = {
            data,
        };
    }

    componentWillReceiveProps(nextProps) {
        const data = nextProps.data || { rows: [] };
        if (this.props.data !== nextProps.data) {
            this.setState({
                data,
            });
        }
    }

    handleCellClick = (key, cellKey) => {
        const { api, id, attribute } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: {
                    $apply: item => !item,
                },
            } },
        } };

        const newAttribute = update(attribute, settings);

        // TODO: complicated cellApplied
        // const cellApplied = !!newAttribute[key][cellKey];

        api.getEntryModifier()
            .setAttribute(id, newAttribute)
            .setShouldUpdate()
            .apply();
    }

    handleCellDrop = (key, cellKey, droppedData) => {
        const { api, id } = this.props;
        const existing = api.getEntryForData(droppedData);

        if (existing) {
            const settings = { $auto: {
                [key]: { $auto: {
                    [cellKey]: {
                        $set: true,
                    },
                } },
            } };

            const attribute = update(api.getEntryAttribute(id, existing.data.id), settings);

            api.selectEntry(existing.data.id);
            api.getEntryModifier(existing.data.id)
                .setAttribute(id, attribute)
                .setShouldUpdate()
                .apply();
        } else {
            const attribute = {
                [key]: {
                    [cellKey]: true,
                },
            };
            api.getEntryBuilder()
                .setData(droppedData)
                .addAttribute(id, attribute)
                .apply();
        }
    }

    renderRow = (key, data) => (
        <MatrixRow
            key={key}
            title={data.title}
            tooltip={data.tooltip}
            cells={data.cells}
            onCellClick={cellKey => this.handleCellClick(key, cellKey)}
            onCellDrop={(cellKey, droppedData) => this.handleCellDrop(key, cellKey, droppedData)}
            selectedCells={this.props.attribute ? this.props.attribute[key] : {}}
        />
    )

    render() {
        const {
            data,
        } = this.state;

        return (
            <ListView
                className={styles.overview}
                data={data.rows}
                keyExtractor={Matrix1dOverview.rowKeyExtractor}
                modifier={this.renderRow}
            />
        );
    }
}
