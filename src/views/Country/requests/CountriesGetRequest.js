import { FgRestBuilder } from '#rsu/rest';
import {
    urlForRegions,
    createParamsForGet,
} from '#rest';
import schema from '#schema';

/*
 * setRegions
*/
export default class CountriesGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'regionsGetResponse');
            this.props.setRegions({
                regions: response.results,
            });
        } catch (er) {
            console.error(er, response);
        }
    }

    failure = (response) => {
        console.warn('FAILURE:', response);
    }

    fatal = (response) => {
        console.warn('FATAL:', response);
    }

    create = () => {
        const countriesRequest = new FgRestBuilder()
            .url(urlForRegions)
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ pendingCountryList: true }); })
            .postLoad(() => { this.props.setState({ pendingCountryList: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return countriesRequest;
    }
}
