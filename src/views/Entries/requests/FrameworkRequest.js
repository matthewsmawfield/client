import Request from '#utils/Request';
import {
    createUrlForProjectFramework,
    createParamsForGet,
} from '#rest';

export default class FrameworkRequest extends Request {
    schemaName = 'analysisFramework';

    handlePreLoad = () => {
        this.parent.setState({ pendingFramework: true, successFramework: false });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingFramework: false });
    }

    handleSuccess = (response) => {
        this.parent.setFramework({ analysisFramework: response });
        this.parent.setSuccess();
    }

    getUrl = () => (
        createUrlForProjectFramework(this.parent.getProjectId())
    )

    init = () => {
        this.createDefault({
            url: this.getUrl,
            params: createParamsForGet,
        });
    }
}

