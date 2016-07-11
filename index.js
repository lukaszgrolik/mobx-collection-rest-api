export default function restApi(opts = {}) {
  if (opts.endpoint === undefined) opts.endpoint = '/';

  return target => {
    Object.assign(target.prototype, {
      fetchAll(axiosOpts) {
        return opts.axios.get(opts.endpoint, axiosOpts)
        .then(res => res.data)
        .then(data => {
          this.inject(data);

          return data;
        });
      },

      fetch(id) {
        return opts.axios.get(`${opts.endpoint}/${id}`)
        .then(res => res.data)
        .then(data => {
          this.inject(data);

          return data;
        });
      },

      create(body) {
        const payload = opts.transformPayload ? opts.transformPayload(body) : body;

        return opts.axios.post(opts.endpoint, payload)
        .then(res => res.data)
        .then(data => {
          this.inject(data);

          return data;
        });
      },

      update(id, body) {
        const payload = opts.transformPayload ? opts.transformPayload(body) : body;

        return opts.axios.put(`${opts.endpoint}/${id}`, payload)
        .then(res => res.data)
        .then(data => {
          this.inject(data);

          return data;
        });
      },

      delete(id) {
        return opts.axios.delete(`${opts.endpoint}/${id}`)
        .then(res => res.data)
        .then(data => {
          this.eject(id);

          return data;
        });
      },
    });

    return target;
  };
};