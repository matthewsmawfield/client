import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../../../../vendor/react-store/utils/immutable-update';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import { compareString } from '../../../../../vendor/react-store/utils/common';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TabularSelectInput from '../../../../../vendor/react-store/components/Input/TabularSelectInput';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    urlForProjectMembership,
    createParamsForProjectMembershipCreate,
    createParamsForUser,
    createUrlForUsers,
} from '../../../../../rest';
import {
    usersInformationListSelector,
    setUsersInformationAction,

    projectDetailsSelector,
    setUsersProjectMembershipAction,
    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../../redux';
import notify from '../../../../../notify';
import schema from '../../../../../schema';
import { iconNames } from '../../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setUsers: PropTypes.func.isRequired,
    setUsersProjectMembership: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    notificationStrings: notificationStringsSelector(state),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    setUsersProjectMembership: params => dispatch(setUsersProjectMembershipAction(params)),
});

const emptyList = [];

// XXX: Skipping refactor as this is to be removed
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddProjectMembers extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.displayName;
    static optionKeySelector = (d = {}) => d.id;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            users,
        } = props;

        const formValues = {
            memberships: [],
        };

        const usersWithRole = users.map(user => ({ ...user, role: 'normal' }));

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues,
            pending: false,
            pristine: false,
            usersWithRole,
            membersBlackList: (projectDetails.memberships || emptyList).map(d => d.member),
        };

        this.memberHeaders = [
            {
                key: 'displayName',
                label: this.props.projectStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.displayName, b.displayName),
            },
            {
                key: 'email',
                label: this.props.projectStrings('tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.email, b.email),
            },
            {
                key: 'actions',
                label: this.props.projectStrings('tableHeaderActions'),
                order: 3,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <div className="actions">
                            <PrimaryButton
                                title={isAdmin ? 'Revoke admin rights' : 'Grant admin rights'}
                                type="button"
                                transparent
                                onClick={() =>
                                    this.handleRoleChangeForNewMember({
                                        memberId: row.id,
                                        newRole: isAdmin ? 'normal' : 'admin',
                                    })
                                }
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                smallVerticalPadding
                            />
                        </div>
                    );
                },
            },
        ];

        this.schema = {
            fields: {
                memberships: [requiredCondition],
            },
        };
    }

    componentWillMount() {
        if (this.usersRequest) {
            this.usersRequest.stop();
        }

        this.usersRequest = this.createRequestForUsers();
        this.usersRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { users } = this.props;

        if (nextProps.users !== users) {
            const usersWithRole = nextProps.users.map(user => ({
                ...user,
                role: 'normal',
            }));
            this.setState({ usersWithRole });
        }
    }

    componentWillUnmount() {
        if (this.usersRequest) {
            this.usersRequest.stop();
        }

        if (this.membershipCreateRequest) {
            this.membershipCreateRequest.stop();
        }
    }

    handleRoleChangeForNewMember = ({ memberId, newRole }) => {
        const index = this.state.usersWithRole.findIndex(user => user.id === memberId);

        if (index !== -1) {
            const settings = {
                [index]: {
                    role: { $set: newRole },
                },
            };
            const newMembers = update(this.state.usersWithRole, settings);
            this.setState({ usersWithRole: newMembers });
        }
    }

    createRequestForUsers = () => {
        const usersFields = ['display_name', 'email', 'id'];
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers(usersFields))
            .params(() => createParamsForUser())
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'usersGetResponse');
                    this.props.setUsers({
                        users: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return usersRequest;
    }

    createRequestForMembershipCreate = (memberList) => {
        const { projectId } = this.props;
        const membershipCreateRequest = new FgRestBuilder()
            .url(urlForProjectMembership)
            .params(() => createParamsForProjectMembershipCreate({ memberList }))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectMembershipCreateResponse');
                    this.props.setUsersProjectMembership({
                        projectId,
                        projectMembership: response.results,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userMembershipCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userMembershipCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipCreateFailure'),
                    duration: notify.duration.SLOW,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    // FIXME: use strings
                    formErrors: { errors: ['Error while trying to save project.'] },
                });
            })
            .build();
        return membershipCreateRequest;
    }

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (values) => {
        const { usersWithRole } = this.state;
        const { projectId } = this.props;
        let newMembersList = usersWithRole.filter(user => (
            values.memberships.findIndex(d => (d === user.id)) !== -1
        ));
        newMembersList = newMembersList.map(member => ({
            member: member.id,
            role: member.role,
            project: projectId,
        }));

        if (this.membershipCreateRequest) {
            this.membershipCreateRequest.stop();
        }

        this.membershipCreateRequest = this.createRequestForMembershipCreate(newMembersList);
        this.membershipCreateRequest.start();
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            formValues,
            pending,
            pristine,
            usersWithRole,
        } = this.state;

        const { className } = this.props;

        return (
            <Form
                className={className}
                styleName="add-member-form"
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors
                    styleName="non-field-errors"
                    formerror=""
                />
                <TabularSelectInput
                    formname="memberships"
                    styleName="tabular-select"
                    blackList={this.state.membersBlackList}
                    options={usersWithRole}
                    optionsIdentifier="select-input-inside-modal"
                    labelSelector={AddProjectMembers.optionLabelSelector}
                    keySelector={AddProjectMembers.optionKeySelector}
                    tableHeaders={this.memberHeaders}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                        disabled={pending}
                    >
                        {this.props.projectStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine}>
                        {this.props.projectStrings('modalUpdate')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
