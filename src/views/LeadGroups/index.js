import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { reverseRoute } from '#rs/utils/common';
import Confirm from '#rs/components/View/Modal/Confirm';
import FormattedDate from '#rs/components/View/FormattedDate';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Pager from '#rs/components/View/Pager';
import RawTable from '#rs/components/View/RawTable';
import TableHeader from '#rs/components/View/TableHeader';
import BoundError from '#rs/components/General/BoundError';

import AppError from '#components/AppError';
import {
    activeProjectIdFromStateSelector,

    leadGroupsForProjectSelector,
    totalLeadGroupsCountSelector,
    leadGroupsViewActivePageSelector,
    leadGroupsViewActiveSortSelector,
    leadGroupsViewFilterSelector,

    setLeadGroupsAction,
    setLeadGroupsActivePageAction,
    setLeadGroupsActiveSortAction,
} from '#redux';

import { pathNames } from '#constants';

import _ts from '#ts';

import LeadGroupsGetRequest from './requests/LeadGroupsGetRequest';
import LeadGroupDeleteRequest from './requests/LeadGroupDeleteRequest';
import ActionButtons from './ActionButtons';
import FilterLeadGroupsForm from './FilterLeadGroupsForm';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setLeadGroups: PropTypes.func.isRequired,
    totalLeadGroupsCount: PropTypes.number,
    setLeadGroupsActivePage: PropTypes.func.isRequired,
    setLeadGroupsActiveSort: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    leadGroups: [],
    totalLeadGroupsCount: 0,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),

    leadGroups: leadGroupsForProjectSelector(state, props),
    totalLeadGroupsCount: totalLeadGroupsCountSelector(state, props),
    activePage: leadGroupsViewActivePageSelector(state, props),
    activeSort: leadGroupsViewActiveSortSelector(state, props),
    filters: leadGroupsViewFilterSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setLeadGroups: params => dispatch(setLeadGroupsAction(params)),

    setLeadGroupsActivePage: params => dispatch(setLeadGroupsActivePageAction(params)),
    setLeadGroupsActiveSort: params => dispatch(setLeadGroupsActiveSortAction(params)),
});

const MAX_LEADGROUPS_PER_REQUEST = 25;

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class LeadGroups extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'title',
                label: _ts('leadGroups', 'titleLabel'),
                order: 1,
                sortable: true,
                modifier: row => row.title,
            },
            {
                key: 'created_at',
                label: _ts('leadGroups', 'createdAt'),
                order: 2,
                sortable: true,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'created_by',
                label: _ts('leadGroups', 'createdBy'),
                order: 3,
                sortable: true,
                modifier: row => (
                    <Link
                        key={row.createdBy}
                        to={reverseRoute(pathNames.userProfile, { userId: row.createdBy })}
                    >
                        {row.createdByName}
                    </Link>
                ),
            },
            {
                key: 'no_of_leads',
                label: _ts('leadGroups', 'noOfLeadsTitle'),
                order: 4,
                sortable: true,
                modifier: row => row.leads.length,
            },
            {
                key: 'actions',
                label: _ts('leadGroups', 'tableHeaderActions'),
                order: 5,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        activeProject={props.activeProject}
                        onRemoveLeadGroup={this.handleRemoveLeadGroup}
                    />
                ),
            },
        ];

        this.state = {
            deleteLeadGroupPending: false,
            dataLoading: true,
            showDeleteModal: false,
        };
    }

    componentWillMount() {
        this.startLeadGroupsRequest();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
        } = nextProps;

        if (
            this.props.activeProject !== activeProject ||
            this.props.activeSort !== activeSort ||
            this.props.filters !== filters ||
            this.props.activePage !== activePage
        ) {
            this.startLeadGroupsRequest(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.requestForLeadGroups) {
            this.requestForLeadGroups.stop();
        }
        if (this.leadGroupDeleteRequest) {
            this.leadGroupDeleteRequest.stop();
        }
    }

    startLeadGroupsRequest = (props = this.props) => {
        const {
            activePage,
            activeProject,
            activeSort,
            filters,
        } = props;

        const { setLeadGroups } = this.props;

        if (this.requestForLeadGroups) {
            this.requestForLeadGroups.stop();
        }
        const requestForLeadGroups = new LeadGroupsGetRequest({
            setState: v => this.setState(v),
            setLeadGroups,
        });
        this.requestForLeadGroups = requestForLeadGroups.create({
            activeProject,
            activePage,
            activeSort,
            filters,
            MAX_LEADGROUPS_PER_REQUEST,
        });
        this.requestForLeadGroups.start();
    }

    leadGroupKeyExtractor = leadGroup => (leadGroup.id.toString())

    leadGroupModifier = (leadGroup, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);
        if (header.modifier) {
            return header.modifier(leadGroup);
        }
        return leadGroup[columnKey];
    }

    handleRemoveLeadGroup = (row) => {
        this.setState({
            showDeleteModal: true,
            leadGroupToDelete: row,
        });
    }

    handleDeleteModalClose = (confirm) => {
        if (confirm) {
            const { leadGroupToDelete } = this.state;
            if (this.leadGroupDeleteRequest) {
                this.leadGroupDeleteRequest.stop();
            }
            const leadGroupDeleteRequest = new LeadGroupDeleteRequest({
                setState: params => this.setState(params),
                pullLeadGroups: this.startLeadGroupsRequest,
            });
            this.leadGroupDeleteRequest = leadGroupDeleteRequest.create(leadGroupToDelete);
            this.leadGroupDeleteRequest.start();
        }

        this.setState({
            showDeleteModal: false,
            leadGroupToDelete: undefined,
        });
    }

    handlePageClick = (page) => {
        this.props.setLeadGroupsActivePage({ activePage: page });
    }

    headerModifier = (headerData) => {
        const { activeSort } = this.props;

        let sortOrder = '';
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }

    handleTableHeaderClick = (key) => {
        const headerData = this.headers.find(h => h.key === key);
        // prevent click on 'actions' column
        if (!headerData.sortable) {
            return;
        }

        let { activeSort } = this.props;
        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }
        this.props.setLeadGroupsActiveSort({ activeSort });
    }

    renderHeader = () => (
        <header className={styles.header} >
            <FilterLeadGroupsForm className={styles.filters} />
        </header>
    )

    renderFooter = () => {
        const {
            totalLeadGroupsCount,
            activePage,
            activeProject,
        } = this.props;

        const showLeadsPageLink = reverseRoute(
            pathNames.leads,
            { projectId: activeProject },
        );

        return (
            <footer className={styles.footer}>
                <Link
                    className={styles.link}
                    to={showLeadsPageLink}
                    replace
                >
                    {_ts('leadGroups', 'showLeads')}
                </Link>
                <Pager
                    activePage={activePage}
                    className={styles.pager}
                    itemsCount={totalLeadGroupsCount}
                    maxItemsPerPage={MAX_LEADGROUPS_PER_REQUEST}
                    onPageClick={this.handlePageClick}
                />
            </footer>
        );
    }

    render() {
        const {
            className,
            leadGroups,
        } = this.props;

        const Header = this.renderHeader;
        const Footer = this.renderFooter;

        const {
            showDeleteModal,
            deleteLeadGroupPending,
            dataLoading,
        } = this.state;

        const loading = dataLoading || deleteLeadGroupPending;

        return (
            <div className={`${styles.leadGroups} ${className}`} >
                {loading && <LoadingAnimation />}
                <Header />
                <div className={styles.tableContainer}>
                    <RawTable
                        data={leadGroups}
                        dataModifier={this.leadGroupModifier}
                        headerModifier={this.headerModifier}
                        headers={this.headers}
                        onHeaderClick={this.handleTableHeaderClick}
                        keyExtractor={this.leadGroupKeyExtractor}
                        className={styles.leadGroupsTable}
                    />
                </div>
                <Footer />
                <Confirm
                    show={showDeleteModal}
                    closeOnEscape
                    onClose={this.handleDeleteModalClose}
                >
                    <p>
                        {_ts('leadGroups', 'leadGroupDeleteConfirmText')}
                    </p>
                </Confirm>
            </div>
        );
    }
}
