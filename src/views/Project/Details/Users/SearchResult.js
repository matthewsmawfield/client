import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    addProjectMembershipAction,
    addProjectUserGroupAction,
} from '#redux';

import { ProjectMembershipPostRequest } from '../../requests/ProjectMembershipRequest';
import ProjectUserGroupPostRequest from '../../requests/ProjectUserGroupRequest';


const propTypes = {
    data: PropTypes.shape({
        type: PropTypes.string.isRequired,
        username: PropTypes.string,
        title: PropTypes.string,
        id: PropTypes.number.isRequired,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        projectId: PropTypes.number,
    }).isRequired,
    setParentPending: PropTypes.func.isRequired,
    clearSearchInput: PropTypes.func.isRequired,
    addProjectMember: PropTypes.func.isRequired,
    addProjectUserGroup: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    addProjectMember: params => dispatch(addProjectMembershipAction(params)),
    addProjectUserGroup: params => dispatch(addProjectUserGroupAction(params)),
});

// Component for rendering each userAndUserGroups search result
// TODO: Beautify this
@connect(null, mapDispatchToProps)
export default class SearchResult extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
        };
        this.createProjectMembershipRequest = new ProjectMembershipPostRequest({
            addProjectMember: (projectId, membership) =>
                this.props.addProjectMember({ projectId, membership }),
            setParentPending: pending => this.props.setParentPending(pending),
            clearSearchInput: () => this.props.clearSearchInput(),
        });
        this.createProjectUserGroupRequest = new ProjectUserGroupPostRequest({
            addProjectUserGroup: (projectId, userGroup) =>
                this.props.addProjectUserGroup({ projectId, userGroup }),
            setParentPending: pending => this.props.setParentPending(pending),
            clearSearchInput: () => this.props.clearSearchInput(),
        });
    }

    componentWillUnmount() {
        this.createProjectMembershipRequest.stop();
        this.createProjectUserGroupRequest.stop();
    }

    addUser = () => {
        const { data: { projectId, id } } = this.props;
        const memberlist = [
            {
                project: projectId,
                member: id,
            },
        ];
        this.createProjectMembershipRequest.init(projectId, memberlist);
        this.createProjectMembershipRequest.start();
    }

    addUserGroup = () => {
        const { data: { projectId, id } } = this.props;
        const projectUserGroup = {
            project: projectId,
            usergroup: id,
        };
        this.createProjectUserGroupRequest.init(projectId, projectUserGroup);
        this.createProjectUserGroupRequest.start();
    }

    render() {
        const {
            data: {
                type,
                username,
                title,
            },
        } = this.props;

        if (type === 'user') {
            return (
                <div>
                    { username }
                    <PrimaryButton
                        onClick={this.addUser}
                    >
                        Add User
                    </PrimaryButton>
                </div>
            );
        } else if (type === 'user_group') {
            return (
                <div>
                    { title }
                    <PrimaryButton
                        onClick={this.addUserGroup}
                    >
                        Add UserGroup
                    </PrimaryButton>
                </div>
            );
        }
        // else
        console.warn('Invalid Search User/UserGroup type');
        return '';
    }
}
