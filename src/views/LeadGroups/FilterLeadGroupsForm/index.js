import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isObjectEmpty } from '#rs/utils/common';
import Button from '#rs/components/Action/Button';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Faram from '#rs/components/Input/Faram';
import SearchInput from '#rs/components/Input/SearchInput';

import {
    activeProjectIdFromStateSelector,

    setLeadGroupsFilterAction,
    leadGroupsViewFilterSelector,
    unsetLeadGroupsFilterAction,
} from '#redux';
import _ts from '#ts';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types

    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setLeadGroupsFilter: PropTypes.func.isRequired,
    unsetLeadGroupsFilter: PropTypes.func.isRequired,

    applyOnChange: PropTypes.bool,
};

const defaultProps = {
    className: '',
    applyOnChange: false,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: leadGroupsViewFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadGroupsFilter: params => dispatch(setLeadGroupsFilterAction(params)),
    unsetLeadGroupsFilter: params => dispatch(unsetLeadGroupsFilterAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterArysForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);
        this.state = {
            faramValues: this.props.filters,
            pristine: true,
        };

        this.schema = {
            fields: {
                search: [],
            },
        };

        this.faramRef = React.createRef();
    }

    componentWillReceiveProps(nextProps) {
        const {
            filters: oldFilters,
            activeProject: oldActiveProject,
        } = this.props;
        const {
            filters: newFilters,
            activeProject: newActiveProject,
        } = nextProps;

        if (oldFilters !== newFilters) {
            // eslint-disable-next-line no-unused-vars
            this.setState({
                faramValues: newFilters,
                pristine: true,
            });
        }
    }

    // UI

    handleFaramChange = (values) => {
        this.setState(
            {
                faramValues: values,
                pristine: false,
            },
            () => {
                if (this.props.applyOnChange) {
                    this.faramRef.current.submit();
                }
            },
        );
    }

    handleFaramValidationSuccess = (values) => {
        this.props.setLeadGroupsFilter({ filters: values });
    }

    handleClearFilters = () => {
        if (isObjectEmpty(this.props.filters)) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({ faramValues: {}, pristine: true });
        } else {
            this.props.unsetLeadGroupsFilter();
        }
    }

    render() {
        const {
            className,
            applyOnChange,
            filters,
        } = this.props;

        const {
            faramValues,
            pristine,
        } = this.state;

        const isApplyDisabled = pristine;

        const isFilterEmpty = isObjectEmpty(filters);
        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Faram
                ref={this.faramRef}
                className={`arys-filters ${className}`}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
            >
                <SearchInput
                    faramElementName="search"
                    label={_ts('leadGroups', 'placeholderSearch')}
                    placeholder={_ts('leadGroups', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                />
                { !applyOnChange &&
                    <Button
                        className="button apply-filter-button"
                        disabled={isApplyDisabled}
                        type="submit"
                    >
                        {_ts('leadGroups', 'filterApplyFilter')}
                    </Button>
                }
                <DangerButton
                    className="button clear-filter-button"
                    disabled={isClearDisabled}
                    onClick={this.handleClearFilters}
                >
                    {_ts('leadGroups', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        );
    }
}