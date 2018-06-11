import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '#rs/utils/common';
import DangerButton from '#rs/components/Action/Button/DangerButton';

import {
    iconNames,
    pathNames,
} from '#constants/';
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
                <DangerButton
                    title={_ts('leadGroups', 'removeLeadGroupButtonTitle')}
                    onClick={() => onRemoveLeadGroup(row)}
                    smallVerticalPadding
                    transparent
                >
                    <i className={iconNames.delete} />
                </DangerButton>
                <Link
                    className={styles.addAryLink}
                    tabIndex="-1"
                    title={_ts('leadGroups', 'addAssessmentFromLeadButtonTitle')}
                    to={links.addAssessment}
                >
                    <i className={iconNames.forward} />
                </Link>
            </Fragment>
        );
    }
}
