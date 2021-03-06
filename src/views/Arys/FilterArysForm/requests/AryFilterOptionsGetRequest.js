import { FgRestBuilder } from '#rsu/rest';
import schema from '#schema';
import {
    createUrlForAryFilterOptions,
    createParamsForGet,
} from '#rest';

export default class AryFilterOptionsGetRequest {
    constructor(params) {
        const {
            setAryFilterOptions,
            setState,
        } = params;
        this.setAryFilterOptions = setAryFilterOptions;
        this.setState = setState;
    }

    create = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForAryFilterOptions(activeProject);

        const aryFilterOptionsRequest = new FgRestBuilder()
            .url(urlForProjectFilterOptions)
            .params(createParamsForGet)
            .preLoad(() => {
                // FIXME: use this
                this.setState({ loadingAryFilters: true });
            })
            .postLoad(() => {
                // FIXME: use this
                this.setState({ loadingAryFilters: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'aryEntryFilterOptionsResponse');
                    this.setAryFilterOptions({
                        projectId: activeProject,
                        aryFilterOptions: response,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .build();

        return aryFilterOptionsRequest;
    }
}
