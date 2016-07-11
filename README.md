```js
import axios from 'axios';
import Collection from 'mobx-collection';
import restApi from 'mobx-collection-rest-api';

@restApi({
  axios: axios.create({
    baseURL: '/api',
  }),
  endpoint: '/foos',
  transformPayload: data => {foo: data},
})
class FooCollection extends Collection {

}

const foos = new FooCollection();

foos.fetchAll();
```