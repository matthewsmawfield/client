import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../../public/components/View';
import {
    TextInput,
    SelectInput,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    DangerButton,
    TransparentButton,
    TransparentAccentButton,
} from '../../../../public/components/Action';
import {
    tokenSelector,
    usersInformationListSelector,
    unSetMembershipAction,
    setUsersMembershipAction,
} from '../../../../common/redux';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipDelete,
    createParamsForUserMembershipCreate,
    urlForUserMembership,
} from '../../../../common/rest';

import { RestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';

import styles from './styles.scss';

const propTypes = {
    memberData: PropTypes.array.isRequired, // eslint-disable-line
    users: PropTypes.array.isRequired, // eslint-disable-line
    token: PropTypes.object.isRequired, // eslint-disable-line
    unSetMembership: PropTypes.func.isRequired, // eslint-disable-line
    userGroupId: PropTypes.number.isRequired,
    setUsersMembership: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    unSetMembership: params => dispatch(unSetMembershipAction(params)),
    setUsersMembership: params => dispatch(setUsersMembershipAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class MembersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddMemberModal: false,
            showDeleteMemberModal: false,
            deletePending: false,
            activeMemberDelete: {},
            nonMemberUsers: this.getNonMemberUsers(props.users, props.memberData),
            newMemberUsers: [],
            saveChangeDisabled: true,
            searchMemberInputValue: '',
            addMemberSelectInputValue: [],
            newMemberList: [],
            memberData: this.props.memberData,
        };
        this.memberHeaders = [
            {
                key: 'memberName',
                label: 'Name',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.memberName.localeCompare(b.memberName),
            },
            {
                key: 'memberEmail',
                label: 'Email',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.memberEmail.localeCompare(b.memberEmail),
            },
            {
                key: 'role',
                label: 'Rights',
                order: 3,
                sortable: true,
                comparator: (a, b) => a.role.localeCompare(b.role),
            },
            {
                key: 'joinedAt',
                label: 'Joined At',
                order: 4,
                sortable: true,
                comparator: (a, b) => a.joinedAt - b.joinedAt,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: row => (
                    <div className="actions">
                        <TransparentButton
                            className="admin-btn"
                        >
                            <i className="ion-ios-locked" />
                        </TransparentButton>
                        <TransparentButton
                            className="delete-btn"
                            onClick={() => this.handleDeleteMemberClick(row)}
                        >
                            <i className="ion-android-delete" />
                        </TransparentButton>
                    </div>
                ),
            },
        ];

        this.newMemberHeaders = [
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
                order: 5,
                modifier: row => (
                    <div className="actions">
                        <TransparentAccentButton
                            className="member-add-btn"
                            onClick={() => this.handleAddNewMemberClick(row)}
                        >
                            <i className="ion-plus" />
                        </TransparentAccentButton>
                        <TransparentButton
                            className="admin-btn"
                        >
                            <i className="ion-ios-locked" />
                        </TransparentButton>
                    </div>
                ),
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            nonMemberUsers: this.getNonMemberUsers(nextProps.users, nextProps.memberData),
            memberData: nextProps.memberData,
        });
    }

    getNonMemberUsers = (users, members) => (
        users.filter(user => (
            members.findIndex(member => (member.member === user.id)) === -1
        ))
    )

    createRequestForMembershipDelete = (membershipId) => {
        const userGroupId = this.props.userGroupId;
        const urlForMembership = createUrlForUserMembership(membershipId);

        const membershipDeleteRequest = new RestBuilder()
            .url(urlForMembership)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserMembershipDelete({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
            })
            .success(() => {
                try {
                    this.props.unSetMembership({
                        membershipId,
                        userGroupId,
                    });
                    this.setState({ showDeleteMemberModal: false });
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
        return membershipDeleteRequest;
    }

    createRequestForMembershipCreate = (memberList) => {
        const userGroupId = this.props.userGroupId;

        const membershipDeleteRequest = new RestBuilder()
            .url(urlForUserMembership)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserMembershipCreate(
                    { access },
                    { memberList },
                );
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .preLoad(() => {
                this.setState({ addPending: true });
            })
            .postLoad(() => {
                this.setState({ addPending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userMembershipCreateResponse');
                    this.props.setUsersMembership({
                        usersMembership: response,
                        userGroupId,
                    });
                    this.setState({
                        showAddMemberModal: false,
                        newMemberList: [],
                        addMemberSelectInputValue: [],
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
        return membershipDeleteRequest;
    }

    handleAddNewMemberClick = (row) => {
        console.log(row);
    };

    handleAddMemberClick = (row) => {
        this.setState({
            editRow: row,
            showAddMemberModal: true,
        });
    }

    handleAddMemberModalClose = () => {
        this.setState({
            // editRow: {},
            showAddMemberModal: false,
            addMemberSelectInputValue: [],
            newMemberList: [],
            saveChangeDisabled: true,
        });
    }

    handleDeleteMemberClick = (row) => {
        this.setState({
            activeMemberDelete: row,
            showDeleteMemberModal: true,
        });
    };

    handleDeleteMemberClose = () => {
        this.setState({ showDeleteMemberModal: false });
    }

    handleRoleChangeForNewMember = (memberId, newRole) => {
        const { newMemberUsers } = this.state;
        const newMemberArrayIndex = newMemberUsers.findIndex(
            newMemberUser => (newMemberUser === memberId));

        if (newMemberArrayIndex !== -1) {
            const updatedNewMemberUsers = [...newMemberUsers];

            updatedNewMemberUsers[newMemberArrayIndex] = {
                ...newMemberUsers[newMemberArrayIndex],
                role: newRole,
            };

            this.setState({
                newMemberUsers: updatedNewMemberUsers,
            });
        }
    }

    addNewMember = (newMember) => {
        const { newMemberUsers } = this.state;
        const newMemberArrayIndex = newMemberUsers.findIndex(
            newMemberUser => (newMemberUser.id === newMember.id));

        if (newMemberArrayIndex !== -1) {
            this.setState({
                saveChangeDisabled: false,
                newMemberUsers: [...this.state.newMemberUsers, newMember],
            });
        }
    }

    saveNewMemberChanges = () => {
        if (this.requestForMembershipCreate) {
            this.requestForMembershipCreate.stop();
        }

        /* NOTE: For pprabesh needed field for rest, TODO: remove this
        const newMemberUsers = [
            {
                id: 1,
                role: 'normal',
                ...other fields
            },
        ];
        */
        let newMemberList = [...this.state.newMemberList];
        const { userGroupId } = this.props;

        newMemberList = newMemberList.map(newMemberUser => (
            {
                group: userGroupId,
                member: newMemberUser.id,
                role: newMemberUser.role,
            }
        ));

        this.requestForMembershipCreate = this.createRequestForMembershipCreate(newMemberList);
        this.requestForMembershipCreate.start();
    }

    deleteActiveMember = () => {
        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }

        const { activeMemberDelete } = this.state;
        this.membershipDeleteRequest = this.createRequestForMembershipDelete(
            activeMemberDelete.id,
        );
        this.membershipDeleteRequest.start();
    }

    applySearch = (memberData, searchInputValue) => {
        const caseInsensitiveSubmatch = (str, value) => (
            !value || (str || '').toLowerCase().includes(
                (value || '').toLowerCase(),
            )
        );

        const newMemberData = memberData.filter(
            memberDatum => (
                caseInsensitiveSubmatch(
                    memberDatum.memberName,
                    searchInputValue,
                )
            ),
        );
        return newMemberData;
    };

    handleSearchMemberChange = (value) => {
        this.setState({
            searchMemberInputValue: value,
            memberData: this.applySearch(this.props.memberData, value),
        });
    }

    handleAddMemberSelectChange = (value) => {
        const { users } = this.props;
        const newMemberList = users.filter(user => value.indexOf(user.id) !== -1);

        this.setState({
            addMemberSelectInputValue: value,
            newMemberList,
            saveChangeDisabled: false,
        });

        console.log('select change', newMemberList);
    }

    render() {
        const {
            activeMemberDelete,
            deletePending,
            memberData,
            saveChangeDisabled,
            showDeleteMemberModal,
            searchMemberInputValue,
            showAddMemberModal,
            addMemberSelectInputValue,
            newMemberList,
            nonMemberUsers,
        } = this.state;

        return (
            <div styleName="members">
                <div styleName="header">
                    <TextInput
                        placeholder="Search Member"
                        onChange={this.handleSearchMemberChange}
                        value={searchMemberInputValue}
                        type="search"
                        styleName="search-input"
                        showLabel={false}
                        showHintAndError={false}
                    />
                    <div styleName="pusher" />
                    <PrimaryButton
                        onClick={this.handleAddMemberClick}
                    >
                        Add New Member
                    </PrimaryButton>
                </div>
                <div styleName="content">
                    <Table
                        data={memberData}
                        headers={this.memberHeaders}
                        keyExtractor={rowData => rowData.id}
                    />
                </div>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddMemberModalClose}
                    show={showAddMemberModal}
                >
                    <ModalHeader
                        title="Add New Member"
                    />
                    <ModalBody
                        styleName="add-member-modal"
                    >
                        <SelectInput
                            placeholder="Search Member"
                            styleName="modal-search-input"
                            showLabel={false}
                            showHintAndError={false}
                            options={nonMemberUsers}
                            keySelector={(user = {}) => user.id}
                            labelSelector={(user = {}) => user.displayName}
                            value={addMemberSelectInputValue}
                            onChange={this.handleAddMemberSelectChange}
                            multiple
                        />
                        <div styleName="new-member-table">
                            <Table
                                data={newMemberList}
                                headers={this.newMemberHeaders}
                                keyExtractor={rowData => rowData.id}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div styleName="action-buttons">
                            <DangerButton
                                onClick={this.handleAddMemberModalClose}
                            >
                                Cancel
                            </DangerButton>
                            <PrimaryButton
                                disabled={saveChangeDisabled}
                                onClick={this.saveNewMemberChanges}
                            >
                                Save changes
                            </PrimaryButton>
                        </div>
                    </ModalFooter>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleDeleteMemberClose}
                    show={showDeleteMemberModal}
                >
                    <ModalHeader title="Delete Member" />
                    <ModalBody>
                        <DeletePrompt
                            handleCancel={this.handleDeleteMemberClose}
                            handleDelete={this.deleteActiveMember}
                            getName={() => (activeMemberDelete.memberName)}
                            getType={() => ('Member')}
                            pending={deletePending}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}