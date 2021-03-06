import { FgRestBuilder } from '#rsu/rest';
import notify from '#notify';
import schema from '#schema';
import {
    createUrlForLeadKeywordCorrelation,
    createParamsForLeadKeywordCorrelation,
} from '#rest';
import _ts from '#ts';

export default class LeadKeywordCorrelationRequest {
    constructor(params) {
        const {
            setLeadVisualization,
            setState,
        } = params;
        this.setLeadVisualization = setLeadVisualization;
        this.setState = setState;
    }

    create = ({ docIds, activeProject, isFilter }) => {
        const request = new FgRestBuilder()
            .url(createUrlForLeadKeywordCorrelation(activeProject, isFilter))
            .params(createParamsForLeadKeywordCorrelation({
                doc_ids: docIds,
            }))
            .preLoad(() => {
                this.setState({ keywordCorrelationDataPending: true });
            })
            .postLoad(() => {
                this.setState({ keywordCorrelationDataPending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'leadKeywordCorrelationResponse');
                    this.setLeadVisualization({
                        keywordCorrelation: response,
                        projectId: activeProject.id,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: _ts('leadsViz', 'keywordCorrelation'),
                    type: notify.type.ERROR,
                    message: _ts('leadsViz', 'keywordCorrelationGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leadsViz', 'keywordCorrelation'),
                    type: notify.type.ERROR,
                    message: _ts('leadsViz', 'keywordCorrelationGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }
}
