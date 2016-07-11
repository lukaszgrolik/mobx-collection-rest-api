const should = require('should');
const axios = require('axios');
const Hapi = require('hapi');
const Collection = require('mobx-collection');

const pkg = require('../package');
const restApi = require('../dist/' + pkg.name + (process.env.NODE_ENV === 'production' ? '.min' : ''));

before(done => {
  const server = this.server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: 3000,
  });

  server.route({
    method: 'GET',
    path: '/',
    handler(req, reply) {
      reply([]);
    },
  });

  server.route({
    method: 'POST',
    path: '/',
    handler(req, reply) {
      reply(Object.assign(req.payload.resource, {id: 1}));
    },
  });

  server.route({
    method: 'GET',
    path: '/tasks',
    handler(req, reply) {
      reply([
        {id: 1, name: 'a'},
        {id: 2, name: 'b'},
        {id: 3, name: 'c'},
      ]);
    },
  });

  server.route({
    method: 'GET',
    path: '/tasks/{id}',
    handler(req, reply) {
      reply({id: 4, name: 'd'});
    },
  });

  server.route({
    method: 'POST',
    path: '/tasks',
    handler(req, reply) {
      reply({id: 5, name: 'e'});
    },
  });

  server.route({
    method: 'PUT',
    path: '/tasks/{id}',
    handler(req, reply) {
      reply({id: 1, name: 'aa'});
    },
  });

  server.route({
    method: 'DELETE',
    path: '/tasks/{id}',
    handler(req, reply) {
      reply({success: true});
    },
  });

  server.start(err => {
    if (err) {
      throw err;
    }

    done();
  });
});

after(done => {
  this.server.stop({}, done);
});

describe('initialization', () => {
  it('adds methods to collection prototype', () => {
    class Foo {};
    Foo = restApi()(Foo);

    const props = ['fetchAll', 'fetch', 'create', 'update', 'delete'];

    Foo.prototype.should.have.properties(props);

    props.forEach(prop => {
      Foo.prototype[prop].should.be.type('function');
    });
  });
});

describe('options', () => {
  describe('endpoint', () => {
    it('defaults to "/"', () => {
      class Foo extends Collection {};

      Foo = restApi({
        axios: axios.create({
          baseURL: 'http://localhost:3000',
        }),
      })(Foo);

      const foo = new Foo();

      return foo.fetchAll()
      .then(data => {
        data.should.be.instanceOf(Array);
        data.should.have.length(0);
      });
    });
  });

  describe('transformPayload', () => {
    it('transform payload before request', () => {
      class Foo extends Collection {};

      Foo = restApi({
        axios: axios.create({
          baseURL: 'http://localhost:3000',
        }),
        transformPayload: body => ({resource: {number: 3 * body.number}}),
      })(Foo);

      const foo = new Foo();

      return foo.create({number: 5})
      .then(data => {
        data.should.containDeepOrdered({id: 1, number: 15});
      });
    });
  });
});

describe('methods', () => {
  beforeEach(() => {
    class Foo extends Collection {};

    Foo = restApi({
      axios: axios.create({
        baseURL: 'http://localhost:3000',
      }),
      endpoint: '/tasks',
    })(Foo);

    this.foo = new Foo();
  });

  describe('fetchAll', () => {
    it('injects results', () => {
      return this.foo.fetchAll()
      .then(() => {
        const records = this.foo.filter();

        records.should.have.length(3);
      });
    });

    it('returns results', () => {
      return this.foo.fetchAll()
      .then(data => {
        data.should.be.instanceOf(Array);
        data.should.containDeepOrdered([
          {id: 1, name: 'a'},
          {id: 2, name: 'b'},
          {id: 3, name: 'c'},
        ]);
      });
    });
  });

  describe('fetch', () => {
    it('injects result', () => {
      return this.foo.fetch()
      .then(() => {
        const records = this.foo.filter();

        records.should.have.length(1);
      });
    });

    it('returns result', () => {
      return this.foo.fetch()
      .then(data => {
        data.should.containDeepOrdered({id: 4, name: 'd'});
      });
    });
  });

  describe('create', () => {
    it('injects result', () => {
      return this.foo.create()
      .then(() => {
        const records = this.foo.filter();

        records.should.have.length(1);
      });
    });

    it('returns result', () => {
      return this.foo.create()
      .then(data => {
        data.should.containDeepOrdered({id: 5, name: 'e'});
      });
    });
  });

  describe('update', () => {
    it('injects result', () => {
      this.foo.inject({id: 1, name: 'a'});

      return this.foo.update()
      .then(() => {
        const records = this.foo.filter();

        records.should.have.length(1);
        records[0].should.have.property('name', 'aa');
      });
    });

    it('returns result', () => {
      return this.foo.update()
      .then(data => {
        data.should.containDeepOrdered({id: 1, name: 'aa'});
      });
    });
  });

  describe('delete', () => {
    it('ejects record', () => {
      this.foo.inject([{id: 1}, {id: 2}]);

      return this.foo.delete(1)
      .then(() => {
        const records = this.foo.filter();

        records.should.have.length(1);
        records[0].should.have.property('id', 2);
      });
    });

    it('returns result', () => {
      return this.foo.delete(1)
      .then(data => {
        data.should.containDeepOrdered({success: true});
      });
    });
  });
});