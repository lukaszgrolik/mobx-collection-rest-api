# mobx-collection-rest-api

REST API decorator for [mobx-collection](https://github.com/lukaszgrolik/mobx-collection)

## Getting started

`npm install --save axios mobx-collection mobx-collection-rest-api`

```js
import axios from 'axios';
import Collection from 'mobx-collection';
import restApi from 'mobx-collection-rest-api';

@restApi({
  axios: axios.create({
    baseURL: '/api',
  }),
  endpoint: '/foos',
  transformPayload: data => ({foo: data}),
})
class FooCollection extends Collection {

}

const foos = new FooCollection();

foos.fetchAll()
.then(() => {
  foos.filter();
  // => [/* records from "GET /api/foos" response */]
});
```

## API

### Options

#### axios

Axios instance to be used for API requests.

- type: [axios](https://github.com/mzabriskie/axios)
- required

```js
@restApi({
  // ...
  axios: axios.create({
    baseURL: '/api/v2',
  }),
})
```

#### endpoint

Endpoint for CRUD operations.

- type: *string*
- default: `'/'`

```js
@restApi({
  // ...
  endpoint: '/users',
})
```

#### transformPayload

Transform payload before making POST or PUT request using `#create` or `#update` method.

- type: *function* with signature `function(record)` where record is object to be transformed

```js
@restApi({
  // ...
  transformPayload: user => {
    return {
      user: {
        id: user.id,
        name: user.username,
      },
    };
  },
})
```

### Methods

Decorator extends Collection's prototype with following methods:

- `#fetchAll()` - GET /{endpoint}
- `#fetch(id)` - GET /{endpoint}/{id}
- `#create(payload)` - POST /{endpoint}
- `#update(id, payload)` - PUT /{endpoint}/{id}
- `#delete(id)` - DELETE /{endpoint}/{id}

Record(s) from API response are automatically injected into collection (or ejected in case of `#delete` method).