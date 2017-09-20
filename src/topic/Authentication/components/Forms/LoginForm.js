import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { PrimaryButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    emailCondition,
    lengthGreaterThanCondition,
} from '../../../../public/utils/Form';


@CSSModules(styles)
export default class LoginForm extends React.PureComponent {
    static propTypes = {
        onLogin: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const form = new Form();
        const elements = ['email', 'password'];
        const validations = {
            email: [
                requiredCondition,
                emailCondition,
            ],
            password: [
                requiredCondition,
                lengthGreaterThanCondition(5),
            ],
        };

        const updateValues = (data) => {
            this.setState({
                formValues: { ...this.state.formValues, ...data },
            });
        };

        const updateErrors = (data) => {
            this.setState({
                formErrors: data,
            });
        };

        const okay = (data) => {
            this.props.onLogin(data.email, data.password);
        };

        form.setElements(elements);
        form.setValidations(validations);

        // calls with new errors
        form.setCallbackForFocus(updateErrors);
        // new state
        form.setCallbackForChange(updateValues);
        // calls with success and error
        form.setCallbackForSuccessAndFailure(okay, updateErrors);

        this.form = form;

        this.state = {
            formErrors: { },
            formValues: { },
        };
    }

    onFocus = (overrideName) => {
        this.form.onFocus(overrideName);
    }

    onChange = (value) => {
        this.form.onChange(value);
    }

    onSubmit = () => {
        this.form.onSubmit();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }

    render() {
        return (
            <form styleName="login-form" onSubmit={this.handleSubmit}>
                <TextInput
                    label="Email"
                    placeholder="john.doe@mail.com"

                    ref={this.form.updateRef('email')}
                    initialValue={this.state.formValues.email}
                    error={this.state.formErrors.email}

                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <TextInput
                    label="Password"
                    hint="You can forget your girlfriend's birthday but not your password"
                    type="password"
                    required

                    ref={this.form.updateRef('password')}
                    initialValue={this.state.formValues.password}
                    error={this.state.formErrors.password}

                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <div styleName="action-buttons">
                    <PrimaryButton>
                        Login
                    </PrimaryButton>
                </div>
            </form>
        );
    }
}
