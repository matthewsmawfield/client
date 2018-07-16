import { FgRestBuilder } from '#rs/utils/rest';
import notify from '#notify';
import {
    createUrlForProjectClusterData,
    createParamsForProjectClusterData,
} from '#rest';
import schema from '#schema';
import _ts from '#ts';
import { unique } from '#rs/utils/common';
import LeadInfoForDocumentRequest from './LeadInfoForDocumentRequest';

export default class ProjectClusterDataRequest {
    constructor(params) {
        const {
            setState,
            setProjectClusterData,
        } = params;
        this.setState = setState;
        this.setProjectClusterData = setProjectClusterData;
    }

    startRequestForLeadsData = (projectId, documents, keywords) => {
        this.stopRequestForLeadsData();
        const leadsDataRequest = new LeadInfoForDocumentRequest({
            projectId,
            documents,
            keywords,
            setProjectClusterData: this.setProjectClusterData,
            setState: this.setState,
        });

        const docs = Object.keys(documents)
            .reduce((arr, i) => arr.concat(documents[i]), []);

        const uniquedocs = unique(docs);
        this.leadsDataRequest = leadsDataRequest.create(projectId, uniquedocs);
        this.leadsDataRequest.start();
    }

    stopRequestForLeadsData = () => {
        if (this.leadsDataRequest) {
            this.leadsDataRequest.stop();
        }
    }

    success = projectId => (response) => {
        try {
            schema.validate(response, 'clusterDataResponse');
            this.startRequestForLeadsData(projectId, response.docs, response.keywords);
        } catch (err) {
            console.error(err);
        }
    }

    failure = (response) => {
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message: response.message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message: _ts('clusterViz', 'clusterDataRequestFatal'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (modelId, projectId) => {
        const clusterDataRequest = new FgRestBuilder()
            .url(createUrlForProjectClusterData(modelId))
            .params(createParamsForProjectClusterData)
            .maxPollAttempts(50)
            .pollTime(2000)
            .shouldPoll((response, status) => status !== 200)
            .success(this.success(projectId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();

        return clusterDataRequest;
    }
}