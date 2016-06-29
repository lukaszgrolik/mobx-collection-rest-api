```js
import Collection from 'collection';
import restApi from 'collection-rest-api';

@restApi({
  axios: axios,
  basePath: '/tasks',
  transformData: data => {task: data},
})
class TaskCollection extends Collection {

}

```