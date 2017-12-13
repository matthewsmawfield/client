import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    NonFieldErrors,
    requiredCondition,
    TabularSelectInput,
} from '../../../../public/components/Input';
import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    DangerButton,
    PrimaryButton,
    TransparentPrimaryButton,
} from '../../../../public/components/Action';
import {
    iconNames,
} from '../../../../common/constants';

import { FgRestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import {
    transformResponseErrorToFormError,
    urlForProjectMembership,
    createParamsForProjectMembershipCreate,
    createParamsForUser,
    createUrlForUsers,
} from '../../../../common/rest';
import {
    usersInformationListSelector,
    setUsersInformationAction,

    projectDetailsSelector,
    setUsersProjectMembershipAction,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    projectId: PropTypes.number, // eslint-disable-line
    users: PropTypes.array.isRequired, // eslint-disable-line
    setUsers: PropTypes.func.isRequired,
    setUsersProjectMembership: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    setUsersProjectMembership: params => dispatch(setUsersProjectMembershipAction(params)),
});

const emptyList = [];

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
            ...projectDetails,
            memberships: [],
            membersBlackList: (projectDetails.memberships || emptyList).map(d => d.member),
        };

        const usersWithRole = users.map(user => ({
            ...user,
            role: 'normal',
        }));

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues,
            pending: false,
            stale: false,
            usersWithRole,
        };

        this.memberHeaders = [
            {
                key: 'displayName',
                label: 'Name',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.displayName.localeCompare(b.displayName),
            },
            {
                key: 'email',
                label: 'Email',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.email.localeCompare(b.email),
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 3,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <div className="actions">
                            <TransparentPrimaryButton
                                title={isAdmin ? 'Revoke admin rights' : 'Grant admin rights'}
                                type="button"
                                onClick={() =>
                                    this.handleRoleChangeForNewMember({
                                        memberId: row.id,
                                        newRole: isAdmin ? 'normal' : 'admin',
                                    })
                                }
                            >
                                {
                                    isAdmin ? <i className={iconNames.locked} />
                                        : <i className={iconNames.person} />
                                }
                            </TransparentPrimaryButton>
                        </div>
                    );
                },
            },
        ];

        this.elements = [
            'memberships',
        ];
        this.validations = {
            memberships: [requiredCondition],
        };

        this.usersFields = ['display_name', 'email', 'id'];
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
            const usersWithRole = users.map(user => ({
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
        const newUserList = [...this.state.usersWithRole];
        const index = newUserList.findIndex(user => user.id === memberId);

        if (index !== -1) {
            newUserList[index].role = newRole;
            this.setState({ usersWithRole: newUserList });
        }
    }

    createRequestForUsers = () => {
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers([this.usersFields]))
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
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
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
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: ['Error while trying to :ave project.'],
                });
            })
            .build();
        return membershipCreateRequest;
    }

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
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
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            stale,
            usersWithRole,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <Form
                className={className}
                styleName="add-member-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors
                    styleName="non-field-errors"
                    errors={formErrors}
                />
                <TabularSelectInput
                    formname="memberships"
                    styleName="tabular-select"
                    blackList={formValues.membersBlackList}
                    options={usersWithRole}
                    labelSelector={AddProjectMembers.optionLabelSelector}
                    onChange={this.handleTabularSelectInputChange}
                    keySelector={AddProjectMembers.optionKeySelector}
                    tableHeaders={this.memberHeaders}
                    error={formFieldErrors.memberships}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale}>
                        Update
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}