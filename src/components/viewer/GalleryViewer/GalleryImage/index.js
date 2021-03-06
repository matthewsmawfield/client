import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import _ts from '#ts';

import styles from './styles.scss';

export { galleryImageMimeType as supportedMimeType } from '#config/deepMimeTypes';

const propTypes = {
    className: PropTypes.string,
    imageUrl: PropTypes.string,
};

const defaultProps = {
    className: '',
    imageUrl: undefined,
};

/*
 * Gallery viewer component for Images [galleryImageMimeType]
 */
export default class GalleryImage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            imageUrl,
        } = this.props;

        return (
            <div className={`gallery-image ${styles.galleryImage} ${className}`}>
                {
                    imageUrl ? (
                        <img
                            alt={_ts('components.galleryImage', 'altUser')}
                            className={`image ${styles.image}`}
                            src={imageUrl}
                        />
                    ) : (
                        <Icon
                            className={`image-alt ${styles.imageAlt}`}
                            name="user"
                        />
                    )
                }
            </div>
        );
    }
}
