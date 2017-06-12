const db = {};

module.exports = {
    find: ({ client, version }) => {
        return new Promise((resolve, reject) => {
            if (!version || !client) {
                return reject({
                    message: 'Version or client are missing',
                    code: 404
                });
            }

            let resource = db[`${client}_${version}`];

            if (resource) {
                resolve(resource);
            } else {
                reject('Version not found');
            }
        });
    },
    create: ({ client, version, data }) => {
        return new Promise((resolve) => {
            let identifier = `${client}_${version}`;
            db[identifier] = Object.assign({}, db[identifier], data);

            resolve(db[identifier]);
        });
    }
};
