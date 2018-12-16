import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';

import { currentUserActiveProjectSelector } from '#redux';
import logo from '#resources/img/deep-logo.svg';
import _ts from '#ts';

import {
    defaultTheme,
    classicDeepTheme,
    setTheme,
} from '#utils/theme';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state),
});

@connect(mapStateToProps, undefined)
export default class Dashboard extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        setTimeout(() => {
            setTheme(classicDeepTheme);
        }, 1000);

        setTimeout(() => {
            setTheme(defaultTheme);
        }, 5000);
    }

    render() {
        const { currentUserActiveProject } = this.props;

        let betaLabel;
        switch (process.env.REACT_APP_DEEP_ENVIRONMENT) {
            case 'beta':
                betaLabel = _ts('dashboard', 'betaLabel');
                break;
            case 'alpha':
                betaLabel = _ts('dashboard', 'alphaLabel');
                break;
            case 'nightly':
                betaLabel = _ts('dashboard', 'nightlyLabel');
                break;
            default:
                betaLabel = _ts('dashboard', 'devLabel');
                break;
        }

        return (
            <div className={styles.dashboard}>
                <p className={styles.header}>
                    { currentUserActiveProject.title }
                </p>
                <div className={styles.content}>
                    <ReactSVG
                        svgClassName={styles.deepLogo}
                        path={logo}
                    />
                    <div className={styles.deepText} >
                        {_ts('dashboard', 'deepLabel')} {betaLabel}
                    </div>
                </div>
            </div>
        );
    }
}
