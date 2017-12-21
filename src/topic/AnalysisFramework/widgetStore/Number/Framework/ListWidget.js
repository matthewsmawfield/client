import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TextInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';


const propTypes = {
    editAction: PropTypes.func.isRequired,
};

@CSSModules(styles)
export default class Number extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.props.editAction(this.handleEdit);
    }

    handleEdit = () => {
        console.log('Edit Number (List)');
    }

    render() {
        return (
            <div styleName="number-list">
                <TextInput
                    disabled
                    placeholder="eg: 147181"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
