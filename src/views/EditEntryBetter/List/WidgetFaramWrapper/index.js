import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import WarningButton from '#rs/components/Action/Button/WarningButton';
import { entryAccessor } from '#entities/editEntriesBetter';
import { iconNames } from '#constants';
import {
    editEntriesSetSelectedEntryKeyAction,
    leadIdFromRoute,
} from '#redux';

import WidgetFaram from '../../WidgetFaram';
import styles from './styles.scss';

const propTypes = {
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    className: PropTypes.string,
    widgetType: PropTypes.string.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
};

const defaultProps = {
    entries: [],
    widgets: [],
    pending: false,
    className: '',
    entry: undefined,
};

const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class WidgetFaramWrapper extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleEdit = (e) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.setSelectedEntryKey({
            leadId: this.props.leadId,
            key: entryKey,
        });
        window.location.replace('#/overview');
        e.preventDefault();
    };

    render() {
        const {
            widgets, // eslint-disable-line no-unused-vars
            className,
            pending,
            widgetType,
            entry,

            ...otherProps
        } = this.props;

        return (
            <div className={className}>
                <WidgetFaram
                    className={styles.widget}
                    entry={entry}
                    widgets={widgets}
                    pending={pending}
                    widgetType={widgetType}
                    {...otherProps}
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        iconName={iconNames.delete}
                        // FIXME: use strings
                        title="Delete Entry"
                    />
                    <WarningButton
                        onClick={this.handleEdit}
                        // FIXME: use strings
                        title="Edit Entry"
                    >
                        <i className={iconNames.edit} />
                    </WarningButton>
                </div>
            </div>
        );
    }
}
