import { FgRestBuilder } from '#rsu/rest';
import {
    createParamsForGet,
    urlForConnectorSources,
} from '#rest';
import _ts from '#ts';
import schema from '#schema';
import notify from '#notify';

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'connectorSources');
            this.props.setConnectorSources({ connectorSources: response.results });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        notify.send({
            title: _ts('connector', 'connectorSourcesTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('connector', 'connectorSourcesTitle'),
            type: notify.type.ERROR,
            message: _ts('connector', 'connectorSourcesGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = () => {
        const connectorsRequest = new FgRestBuilder()
            .url(urlForConnectorSources)
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
