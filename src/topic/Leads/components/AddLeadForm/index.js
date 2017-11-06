import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';
import TextInput from '../../../../public/components/TextInput';
import DateInput from '../../../../public/components/DateInput';
import HiddenInput from '../../../../public/components/HiddenInput';
import SelectInput from '../../../../public/components/SelectInput';
import TextArea from '../../../../public/components/TextArea';
import Form, {
    requiredCondition,
    urlCondition,
} from '../../../../public/components/Form';
import { RestBuilder } from '../../../../public/utils/rest';

import {
    PrimaryButton,
    SuccessButton,
} from '../../../../public/components/Button';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    leadFilterOptionsForProjectSelector,
} from '../../../../common/selectors/domainData';
import {
    tokenSelector,
} from '../../../../common/selectors/auth';
import {
    setLeadFilterOptionsAction,
} from '../../../../common/action-creators/domainData';

// uploadStates -> birth, uploading, success, fail
// formStates -> stale, error, pending
const propTypes = {
    className: PropTypes.string,
    formValues: PropTypes.object.isRequired, // eslint-disable-line
    leadId: PropTypes.string.isRequired,
    leadType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
    ready: PropTypes.bool.isRequired,
    stale: PropTypes.bool.isRequired,
    uploadData: PropTypes.object, // eslint-disable-line
    activeProject: PropTypes.number.isRequired,
    setLeadFilterOptions: PropTypes.func.isRequired,
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line 
};
const defaultProps = {
    className: '',
    uploadData: {},
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    leadFilterOptions: leadFilterOptionsForProjectSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            formErrors: [],
            formFieldErrors: {},
        };
        this.elements = [
            'project',
            'title',
            'source',
            'confidentiality',
            'user',
            'date',
            'url',
            'website',
            'server_id',
            'text',
        ];
        this.validations = {
            title: [requiredCondition],
            source: [requiredCondition],
            confidentiality: [requiredCondition],
            user: [requiredCondition],
            date: [requiredCondition],
            url: [
                requiredCondition,
                urlCondition,
            ],
            website: [requiredCondition],
            // TODO: add validation for server_id
        };
    }

    componentDidMount() {
        const { activeProject } = this.props;
        this.requestProjectLeadFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.activeProject !== nextProps.activeProject) {
            this.requestProjectLeadFilterOptions(nextProps.activeProject);
        }
    }

    requestProjectLeadFilterOptions = (activeProject) => {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line
        this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(activeProject);
        this.leadFilterOptionsRequest.start();
        this.setState({
            loadingLeadFilters: true,
        });
    }

    createRequestForProjectLeadFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForLeadFilterOptions(activeProject);

        const leadFilterOptionsRequest = new RestBuilder()
            .url(urlForProjectFilterOptions)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .success((response) => {
                try {
                    // TODO:
                    // schema.validate(response, 'leadFilterOptionsGetResponse');
                    this.props.setLeadFilterOptions({
                        projectId: activeProject,
                        leadFilterOptions: response,
                    });
                } catch (er) {
                    console.error(er);
                }
                this.setState({
                    loadingLeadFilters: false,
                });
            })
            .retryTime(1000)
            .build();

        return leadFilterOptionsRequest;
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        console.log(values);
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
        this.props.onChange(this.props.leadId, values);
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
        this.props.onFailure(this.props.leadId);
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
        this.props.onSuccess(this.props.leadId, values);
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
        } = this.state;

        const {
            className,
            pending,
            formValues,
            stale,
            ready,
            leadType,
            uploadData,
            leadFilterOptions,
        } = this.props;

        return (
            <Form
                changeCallback={this.changeCallback}
                className={className}
                elements={this.elements}
                failureCallback={this.failureCallback}
                onSubmit={this.handleSubmit}
                styleName="add-lead-form"
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
            >
                {
                    pending &&
                        <div styleName="pending-overlay">
                            <i
                                className="ion-load-c"
                                styleName="loading-icon"
                            />
                        </div>
                }
                <header styleName="header">
                    <div styleName="non-field-errors">
                        {
                            formErrors.map(err => (
                                <div
                                    key={err}
                                    styleName="error"
                                >
                                    {err}
                                </div>
                            ))
                        }
                        {
                            formErrors.length <= 0 &&
                                <div styleName="error empty">
                                    -
                                </div>
                        }
                    </div>
                    <div styleName="action-buttons">
                        <SuccessButton
                            disabled={pending || !stale || !ready}
                        >
                            Save
                        </SuccessButton>
                        <PrimaryButton
                            disabled={pending || !stale || !ready}
                        >
                            Save &amp; next
                        </PrimaryButton>
                    </div>
                </header>
                <TextInput
                    label="Title"
                    formname="title"
                    placeholder="Enter a descriptive name"
                    styleName="title"
                    initialValue={formValues.title}
                    error={formFieldErrors.title}
                />
                <TextInput
                    label="Source"
                    formname="source"
                    placeholder="Enter a descriptive name"
                    styleName="source"
                    initialValue={formValues.source}
                    error={formFieldErrors.source}
                />
                <SelectInput
                    label="Confidentiality"
                    formname="confidentiality"
                    placeholder="Select a confidentiality"
                    options={leadFilterOptions.confidentiality}
                    selectedOptionKey={formValues.confidentiality}
                    styleName="confidentiality"
                    keySelector={d => (d || {}).key}
                    labelSelector={d => (d || {}).value}
                    error={formFieldErrors.confidentiality}
                    showLabel
                    showHintAndError
                />
                <SelectInput
                    label="Assign To"
                    formname="user"
                    placeholder="Select a user"
                    options={leadFilterOptions.assignedTo}
                    selectedOptionKey={formValues.user}
                    styleName="user"
                    initialValue={formValues.user}
                    error={formFieldErrors.user}
                    keySelector={d => (d || {}).key}
                    labelSelector={d => (d || {}).value}
                    showLabel
                    showHintAndError
                />
                <DateInput
                    label="Publication Date"
                    formname="date"
                    placeholder="Enter a descriptive name"
                    styleName="date"
                    initialValue={formValues.date}
                    error={formFieldErrors.date}
                />
                <SelectInput
                    label="Project"
                    formname="project"
                    placeholder="Select a project"
                    options={leadFilterOptions.project}
                    selectedOptionKey={formValues.project}
                    styleName="project"
                    keySelector={d => (d || {}).key}
                    labelSelector={d => (d || {}).value}
                    error={formFieldErrors.project}
                    showLabel
                    showHintAndError
                />
                {
                    leadType === 'website' && [
                        <TextInput
                            key="url"
                            label="URL"
                            formname="url"
                            placeholder="Enter a descriptive name"
                            stylename="url"
                            initialValue={formValues.url}
                            error={formFieldErrors.url}
                        />,
                        <TextInput
                            key="website"
                            label="Website"
                            formname="website"
                            placeholder="Enter a descriptive name"
                            styleName="website"
                            initialValue={formValues.website}
                            error={formFieldErrors.website}
                        />,
                    ]
                }
                {
                    leadType === 'text' &&
                        <TextArea
                            formname="text"
                            label="Text"
                            placeholder="Enter text"
                            initialValue={formValues.text}
                            rows="3"
                            styleName="text"
                        />
                }
                {
                    leadType === 'file' && ([
                        <p
                            key="title"
                            styleName="file-title"
                        >
                            { uploadData.error ? uploadData.error : uploadData.title }
                        </p>,
                        <HiddenInput
                            key="input"
                            formname="server_id"
                            initialValue={formValues.server_id}
                        />,
                    ])
                }
            </Form>
        );
    }
}
