import { FgRestBuilder } from '#rsu/rest';
import {
    createParamsForGet,
    createUrlForConnectorsOfProject,
    transformAndCombineResponseErrors,
} from '#rest';
import _ts from '#ts';

import schema from '#schema';
import notify from '#notify';

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = projectId => (response) => {
        const {
            setConnectorsOfProject,
        } = this.props;
        try {
            schema.validate(response, 'connectors');
            const connectors = {};
            response.results.forEach((c) => {
                connectors[c.id] = c;
            });
            setConnectorsOfProject({
                connectors,
                projectId,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const message = transformAndCombineResponseErrors(response.errors);
        notify.send({
            title: _ts('addLeads', 'connectorTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = (response) => {
        console.warn('fatal:', response);
    }

    create = (projectId) => {
        const connectorsRequest = new FgRestBuilder()
            .url(createUrlForConnectorsOfProject(projectId))
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success(projectId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
