import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import { pathNames } from '#constants/';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    onRemoveLeadGroup: PropTypes.func.isRequired,
};

const defaultProps = {};


export default class LeadGroupsActionButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getLinks = () => {
        const {
            activeProject,
            row,
        } = this.props;

        const addAssessment = reverseRoute(
            pathNames.editLeadGroupAssessment,
            {
                projectId: activeProject,
                leadGroupId: row.id,
            },
        );

        return { addAssessment };
    }

    render() {
        const links = this.getLinks();
        const {
            onRemoveLeadGroup,
            row,
        } = this.props;

        return (
            <Fragment>
                <DangerConfirmButton
                    title={_ts('leadGroups', 'removeLeadGroupButtonTitle')}
                    onClick={() => onRemoveLeadGroup(row)}
                    smallVerticalPadding
                    transparent
                    iconName="delete"
                    confirmationMessage={_ts('leadGroups', 'leadGroupDeleteConfirmText')}
                />
                <Link
                    className={styles.addAryLink}
                    tabIndex="-1"
                    title={_ts('leadGroups', 'addAssessmentFromLeadButtonTitle')}
                    to={links.addAssessment}
                >
                    <Icon name="forward" />
                </Link>
            </Fragment>
        );
    }
}
