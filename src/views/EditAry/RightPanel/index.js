import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MultiViewContainer from '#rscv/MultiViewContainer';
import FixedTabs from '#rscv/FixedTabs';
import Faram from '#rscg/Faram';

import {
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,

    assessmentSchemaSelector,
    assessmentComputeSchemaSelector,

    changeAryForEditAryAction,

    editAryFaramValuesSelector,
    editAryFaramErrorsSelector,
} from '#redux';
import _ts from '#ts';
import TabTitle from '#components/TabTitle';

import Metadata from './Metadata';
import Summary from './Summary';
import Score from './Score';
import Methodology from './Methodology';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number,
    activeLeadGroupId: PropTypes.number,
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    computeSchema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    editAryFaramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryFaramErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    changeAry: PropTypes.func.isRequired,
    onActiveSectorChange: PropTypes.func,
    pending: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    schema: {},
    pending: false,
    computeSchema: {},
    editAryFaramErrors: {},
    editAryFaramValues: {},
    onActiveSectorChange: undefined,

    activeLeadId: undefined,
    activeLeadGroupId: undefined,
    readOnly: false,
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    activeLeadGroupId: leadGroupIdFromRouteSelector(state),

    editAryFaramValues: editAryFaramValuesSelector(state),
    editAryFaramErrors: editAryFaramErrorsSelector(state),

    schema: assessmentSchemaSelector(state),
    computeSchema: assessmentComputeSchemaSelector(state),
});

const mapDispatchToProps = dispatch => ({
    changeAry: params => dispatch(changeAryForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.tabs = {
            metadata: _ts('editAssessment', 'metadataTabLabel'),
            methodology: _ts('editAssessment', 'methodologyTabLabel'),
            summary: _ts('editAssessment', 'summaryTabLabel'),
            score: _ts('editAssessment', 'scoreTabLabel'),
        };

        this.defaultHash = 'metadata';

        this.views = {
            metadata: {
                component: () => (
                    <Metadata
                        className={styles.metadata}
                        pending={this.props.pending}
                    />
                ),
            },
            summary: {
                component: () => (
                    <Summary
                        className={styles.summary}
                        pending={this.props.pending}
                        onActiveSectorChange={this.props.onActiveSectorChange}
                    />
                ),
            },
            methodology: {
                component: () => (
                    <Methodology pending={this.props.pending} />
                ),
            },
            score: {
                component: () => (
                    <Score
                        className={styles.score}
                        pending={this.props.pending}
                    />
                ),
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        const isPristine = faramInfo.isComputed;

        if (this.props.activeLeadId) {
            this.props.changeAry({
                leadId: this.props.activeLeadId,
                faramValues,
                faramErrors,
                isPristine,
            });
        } else {
            this.props.changeAry({
                leadGroupId: this.props.activeLeadGroupId,
                faramValues,
                faramErrors,
                isPristine,
            });
        }
    }

    renderTab = (tabKey) => {
        const title = this.tabs[tabKey];
        return (
            <TabTitle
                title={title}
                faramElementName={tabKey}
            />
        );
    }

    render() {
        const {
            editAryFaramValues,
            editAryFaramErrors,
            schema,
            computeSchema,
            pending,
            readOnly,
        } = this.props;

        return (
            <Faram
                className={styles.rightPanel}
                schema={schema}
                computeSchema={computeSchema}
                value={editAryFaramValues}
                error={editAryFaramErrors}
                onChange={this.handleFaramChange}
                disabled={pending}
                readOnly={readOnly}
            >
                <FixedTabs
                    className={styles.tabs}
                    useHash
                    defaultHash={this.defaultHash}
                    replaceHistory
                    tabs={this.tabs}
                    modifier={this.renderTab}
                />
                <MultiViewContainer
                    useHash
                    views={this.views}
                />
            </Faram>
        );
    }
}
