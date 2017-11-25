import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    createParamsForUser,
    createUrlForRegion,
} from '../../../../common/rest';
import {
    tokenSelector,

    regionDetailForRegionSelector,
    setRegionDetailsAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import RegionDetail from '../../../../common/components/RegionDetail';
import RegionDetailView from '../../../../common/components/RegionDetailView';
import RegionAdminLevel from '../../../../common/components/RegionAdminLevel';

import styles from './styles.scss';

const propTypes = {
    regionId: PropTypes.number.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    regionDetails: PropTypes.object.isRequired, // eslint-disable-line
    setRegionDetails: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    regionDetails: regionDetailForRegionSelector(state, props),
    token: tokenSelector(state),
});
const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectRegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.regionRequest = this.createRegionRequest(props.regionId);
    }

    componentWillMount() {
        this.regionRequest.start();
    }

    componentWillUnmount() {
        if (this.regionRequest) {
            this.regionRequest.stop();
        }
    }

    createRegionRequest = (regionId) => {
        const regionRequest = new RestBuilder()
            .url(createUrlForRegion(regionId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .preLoad(() => { this.setState({ dataLoading: true }); })
            .postLoad(() => { this.setState({ dataLoading: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'region');
                    this.props.setRegionDetails({
                        regionDetails: response,
                        regionId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return regionRequest;
    };

    render() {
        const {
            regionId,
            regionDetails,
        } = this.props;

        const { dataLoading } = this.state;

        const isPublic = regionDetails.public;

        return (
            <div styleName="region-details-container">
                <header styleName="header">
                    <h2>
                        {regionDetails.title}
                    </h2>
                    <div styleName="action-btns">
                        <DangerButton>
                            Remove Region
                        </DangerButton>
                        {isPublic &&
                            <PrimaryButton
                                styleName="clone-btn"
                            >
                                Clone and Edit
                            </PrimaryButton>
                        }
                    </div>
                </header>
                {!isPublic &&
                    <div styleName="region-details">
                        <div styleName="detail-map-container">
                            <RegionDetail
                                dataLoading={dataLoading}
                                regionId={regionId}
                                styleName="region-detail-form"
                            />
                            <div styleName="map-container">
                                The map
                            </div>
                        </div>
                        <RegionAdminLevel
                            styleName="admin-levels"
                            regionId={regionId}
                        />
                    </div>
                }
                {isPublic &&
                    <div styleName="region-details-non-edit">
                        <RegionDetailView regionId={regionId} />
                        <div styleName="map-container-non-edit">
                            The map
                        </div>
                    </div>
                }
            </div>
        );
    }
}