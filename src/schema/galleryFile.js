const galleryFileSchema = [];

{
    const name = 'galleryFile';
    const schema = {
        doc: {
            name: 'Gallery file',
            description: 'Standard gallery file',
        },
        extends: 'dbentity',
        fields: {
            file: { type: 'string', required: true }, // url
            isPublic: { type: 'boolean' },
            metadata: { type: 'object' },
            mimeType: { type: 'string' }, // mime
            permittedUserGroups: { type: 'array.uint' },
            permittedUsers: { type: 'array.uint' },
            title: { type: 'string', required: true },
            projects: { type: 'array.uint' },
        },
    };
    galleryFileSchema.push({ name, schema });
}
{
    const name = 'galleryFilesGetResponse';
    const schema = {
        doc: {
            name: 'Gallery Files Get Response',
            description: 'Response for GET /files/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.galleryFile', required: true },
        },
    };
    galleryFileSchema.push({ name, schema });
}

export default galleryFileSchema;
