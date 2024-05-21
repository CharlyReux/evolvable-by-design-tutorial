# Tutorial

## What you will need for this tutorial

The two easiest ways are either **remotely**, in a GitHub CodeSpace via this [link](https://github.com/codespaces/new?template_repository=CharlyReux/evolvable-by-design-tutorial), with it, you will be able to start instantly (It is free, unless you go over 60 hours of runtime). Or **locally**, by using a Dev Container (you will need Docker, VS Code and the extension `ms-vscode-remote.remote-containers`). In either case, it should take a little bit of time to set up your environment.
#### Using a Dev Container TODO : try
If using a Dev Container, you will first have to press F1 and run `Dev Containers: Clone Repository in Container Volume`  
Enter the repository name `CharlyReux/evolvable-by-design-tutorial`  
The repository should load, and you are ready to go.

#### Without Dev Containers
If you are not willing to use GitHub CodeSpace or a Dev Container, you can try this tutorial locally, for this you will need the following dependencies:
TODO


> once you are setup you can start the tutorial by following the steps below.

## What is Pivo?
It has become common practice: we use RESTful APIs to access and manipulate data on frontend applications. And to build these frontends, we separate the logic of the view and navigation from the logic that makes the REST API calls. While the logic of the view is materialized through components, the logic of the interactions with the REST API is dispatched into services. For example, all the calls to the Issues on the GitHub API would be done in an IssueService.

But one issue arises, when the REST API changes, the front-end application is very likely to break. Something as little as changing the name of a field in a back-end can break a front-end implementation. Therefore, we devised an approach called *Evolvable-By-Design*, and a framework named *Pivo* with the purpose of tackling with the co-evolution of the front-end and the back-end.  

## Example

The approach is based on the use of Semantic data and the OpenApi Specification to ensure that front-end does not break.
Here is an example of how it would look like in practice in a React application.

Let's say we have an application that displays card details, it would look like this, if implemented in a classical manner.
```jsx
const CardDetailsComponent = ({ card }) =>
  <right-pane>
    <h1>{card.name}</h1>
    <h2>Description</h2>
    <p>{card.description}</p>
    <h2>ACTIONS</h2>

    <pop-up-with-button buttonLabel="Delete"
      onConfirm={(reason) => CardService.delete(card.id, reason)}>
      <input type="text" label="reason" />
    </pop-up-with-button>
  </right-pane>

class CardService {
  function delete(cardId, reason) {
    Http.delete({
      url: '/cards/' + cardId,
      body: { reason }
    })
  }
}
```

**But what if the API provider decides to change its implementation?<br>**
This implementation of the CardDetailsComponent would break, as it is tightly linked to backend implementation of the API.
Here are some changes that would break it:
- The URI changes (/card instead of /cards)
- The location of the id is changed from the URL to the request body.
- A non-admin user is not allowed to delete a card anymore.

To solve that, we leverage Semantic data and the OpenApi Specification.
With an OpenAPI specification enhanced with Semantic descriptors like this one:
```yml
paths:
  /cards/{id}:
    delete:
      summary: deletes a card with the id provided
      operationId: deleteCard
      x-@type: https://schema.org/DeleteAction
      x-@id: http://myVoc.org/vocab#deleteCard
      parameters:
        - $ref: '#/components/parameters/id'
      responses:
        '204':
          description: Card deleted
    get:
      x-@id: http://myVoc.org/vocab#getCard
      summary: 'gets a card by its id'
      operationId: getCard
      parameters:
        - $ref: '#/components/parameters/id'
      responses:
        "200":
          description: The card retrieved
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Card"
          links:
            delete:
              operationId: deleteCard
              x-@relation: http://myVoc.org/vocab#rel/deleteCard
              parameters:
                id: '$response.body#/id'
components:
  schemas:
    Card:
      x-@id: http://myVoc.org/vocab#card
      properties:
        name:
          x-@id: https://schema.org/name
          type: string
        id:
          x-@id: https://schema.org/identifier
          type: integer
  parameters:
    id:
        in: path
        name: id
        description: the id of the card to be deleted
        required: true
        x-@id: https://schema.org/identifier
        schema:
          type: integer
```

We can change our implementation to leverage it and make our component *Evolvable-By-Design*:

```jsx
const DELETE_SEMANTICS = 'http://myVoc.org/vocab#rel/deleteCard' 

// Type of the card param below: SemanticResource
// SemanticResource is custom to the library
// It maps the data from the API to the semantic descriptors found in the documentation
function showCardDetailsComponent ({ card }) {
  return (
    <right-pane>
      <h1>{card.getOneValue('https://schema.org/name')}</h1>
      <if test={
        card.isRelationAvailable(DELETE_SEMANTICS)}>
        <pop-up-with-button
          buttonLabel='Delete'
          formSchema={card.getRelation(DELETE_SEMANTICS,1).operation.operationSchema}
          onConfirm={formValues =>
            CardService.delete(card, formValues)
          }
        />
      </if>
    </right-pane>
  )
}
class CardService {
  static delete (card, userInputs) {
    const operation = card
      .getRelation(AppDictionary.relations.DELETE, 1)
      .map(relation => relation.operation)
      .getOrThrow(
        () => new Error('The REST API operation to delete a card is not available')
      )

    return operation.invoke(userInputs)
  }
}
```

This approach allows for a co-evolution of the front-end and the back-end, and covers the breaking changes we discussed earlier.


## Do it yourself: Make an application *Evolvable-By-Design*

### Introduction
To get you started with the *Pivo* approach, you will be making a simple application to display information about a user

Start by launching the back-end with the commands
 ```sh
 cd backend/v1
 npm install
 npm run dev
 ```
You can launch the front-end with the command
```sh
cd frontend
npm install
npm run dev
```

On the [page](http://localhost:5173/) You should now see the simple application that you will work on.

### Displaying user information

The goal of the application is simply to display user information when entering an id and pressing the button.
There are curently two users, with the ids 1 and 2, but for now they are not displayed, as the app is not set up yet.


A simple UI is provided in [App.jsx](frontend/src/App.jsx), you can look around to see how it works. 
However the calls for the API is not setup yet, so requesting to the backend won't do much for now.


In the [User Service](frontend/src/services/UserService.js), you can implement the getUserInfo() method with the following code:

```ts
async getUserInfo(userId) {
    const response = await axios.get(`${this.baseUrl}/users/${userId}`)
    if (response.status !== 200) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
    }
    return response.data;
}
```

Now save, and you should see that the user is indeed displayed in the app.

### Introducing a breaking change
We will now see how an update in the backend application can break our simple UI.

For some reason, the provider decided to add these changes in the REST API:
- Changed the id parameter location from a path parameter to a query parameter
- Changed the /users endpoint to /user

In order to apply the changes, stop the backend, and run the new version of it, in `backend/v2`:
```sh
 cd ../v2
 npm install
 npm run dev
 ```

And you should see in your front-end that requesting for a user does not work anymore.

In order to fix it, you now have to
- First, Change the endpoint used in the `getUserInfo()` method from `${this.baseUrl}/users/${userId}` to `${this.baseUrl}/user/${userId}`.
> However, it still does not work because the id must not be in the path anymore.
- To fix this, change the axios request to 
  - `` await axios.get(`${this.baseUrl}/user`,{params: {id: userId}}) ``
`


Now, your application should be working. Of course, these were simple evolutions in the backend that do not require many changes to be made. But this can quickly become a time-consuming issue when the codeBase starts getting bigger, or maybe when you haven't been maintaining the application for a while, so it takes you longer to get back into it.

### Making the application *Evolvable-By-Design*

What if your application could evolve as the same time as the back-end, without anyone having to make the manual changes?

This is the idea of the *Pivo* library that we will now leverage to make our application resilient to changes.

In your front-end, run the following command:
```sh
npm i @evolvable-by-design/pivo
```

The documentation can be found [here](https://github.com/evolvable-by-design/pivo/tree/master/packages/pivo)

In order for the library to work, we need an enhanced openApi specification file that leverages semantic annotations, that is provided in each of the backends at the `/openapi.json` endpoint(http://localhost:3000/openapi.json).

#### Setting up Pivo in our application

>*Note:* Some of the changes are made simpler for the sake of readability of this tutorial.

First, we will start by setting up our UserService to use the library, in App.jsx, make the following changes :
```jsx
function App() {
- const userServices = new ProfileService('http://localhost:3000');
+ const [userService, setUserService] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);


+ useEffect(() => {
+   UserService.forApiAtUrl("http://localhost:3000/openapi.json").then(setUserService)
+ }, [])

  const getUserInfos = (id) => {
    if (!id) {
      return;
    }
    userService.getUserInfo(id)
      .then((user) => setCurrentUser(user))
      .catch((error) => alert(error));
    console.log('User info:', currentUser);
...
}

```

Now in our UserService we will make these changes:

```js
 -   constructor(baseUrl) {
 -       this.baseUrl = baseUrl;
 -   }
 +   constructor(documentation) {
 +       this.pivo = new Pivo(documentation);
 +   }

 +   static async forApiAtUrl(url) {
 +       const response = await axios.get(url)
 +       if (response.status === 200) {
 +           console.log(response.data)
 +           return new UserService(response.data)
 +       } else {
 +           const errorMessage = `Impossible to get the documentation of the API at ${url}.`
 +           alert(errorMessage)
 +           throw new Error(errorMessage)
 +       }
 +   }

``` 

As said earlier, pivo needs the openAPI specification file in order to be working. What we have done here is to fetch that specification upon the initial loading of the app, in order to instantiate our service with it.
We basically have made our service depend on the specification rather than on the base URL.

#### Using Pivo

However, our app still doesn't work as we need to use pivo in our implementation of the request and in our ProfileCard component.

First, we will replace the getUserInfo method to return a Semantic Resource 
```tsx
    /**
     * Gets the user info from the server, provided the user Id
     * @param userId the Id of the user to fetch
     * @returns The user Semantic object
     */
    async getUserInfo(userId) {

        const getOperation = this.pivo
            .get("http://myVoc.org/vocab#user")
            .getOrThrow(() => new Error("No operations found for fetching user info."))

        const response = await getOperation.invoke({ ["https://schema.org/identifier"]: userId })

        if (response.status !== 200) {
            throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        return response.data;
    }
```


> ##### *Explanation*
> A semantic resource is simply an object that contains everything that can be inferred from the specification and the response object(links, response, relations, etc)<br>
> The library leverage the enhanced openApi file in order to automatically infer the appropriate parameters, methods, etc.<br>
> To get the operation we need, we ask the library to find an operation that can get us a user (defined by our vocabulary "http://myVoc.org/vocab#user").<br>
> We then invoke the operation with the userId parameter and the appropriate entity https://schema.org/identifier, note that we don't have to tell the application where the parameter needs to be defined, the library will automatically infer whether it is in the path, the body, etc.<br>
> You can check where the two entity identifier `http://myVoc.org/vocab#user` and `https://schema.org/identifier` are defined in http://localhost:3000/openapi.yml in order to get a feel of how the library works.<br>
> <br>

We now need to update our profileCard component accordingly, so that it can use the new type of data the service gets.

We provide a utility class *`WithSemanticDataRequired`* that simplifies the usage of the library, here is how our component looks like now.

```jsx
export default function ProfileCard(props) {
    const [user, setUser] = useState(props.user)
    useEffect(() => {
        setUser(props.user)
    }, [props.user])

    return (
        <WithSemanticDataRequired
            data={user}
            mappings={{
                firstName: "https://schema.org/givenName",
                lastName: "https://schema.org/familyName",
                email: "https://schema.org/email",
                bio: "https://schema.org/abstract",
                createdAt: "https://schema.org/dateCreated"
            }}
            loader={<div>Loading...</div>}>
            {({ firstName, lastName, email, bio, createdAt }) => (

                <Card variant='outlined' sx={{ maxWidth: 400, margin: 'auto', marginTop: 20 }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ marginBottom: 2 }}>
                            {firstName} {lastName}
                        </Typography>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>
                            Email: {email}
                        </Typography>
                        <Typography variant="body1" sx={{ marginBottom: 2 }}>
                            Bio: {bio}
                        </Typography>
                        <Typography variant="body2">
                            Created At: {createdAt}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </WithSemanticDataRequired>
    )
}
```

> ##### *Explanation*
> The component simplifies the usage of the library by providing a mapping between the semantic identifiers and their values.<br>
> Without this component we could get values from the user with the following syntax:
> ```ts
> const firstName = await user.getOneValue("https://schema.org/givenName")
>```
><br>
<br>
The application should now display the user's information, you can even switch to the previous backend implementation and you should see that it still works:

```sh
cd ../v1
npm run dev
```


#### More features

These were of course simple changes, but the library allows our application to have convenient behaviors.

For example, the backend provides a way to delete a user, as can be seen in the openApi.json file:

```yml
/user:
  get:
    x-@id: http://myVoc.org/vocab#getUser
    summary: gets a user by its id
    operationId: getUser
    parameters:
      - $ref: '#/components/parameters/id'
    responses:
      '200':
        description: The user retrieved
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
        links:
          deleteUser:
            operationId: deleteUser
            x-@relation: http://myVoc.org/#rel/delete
            parameters:
              id: $response.body#/id
  delete:
    x-@id: http://myVoc.org/vocab#deleteUser
    summary: deletes a user by its id
    parameters:
      - $ref: '#/components/parameters/id'
    operationId: deleteUser
    responses:
      '204':
        description: user deleted
```

> *Note*: the delete method is a dummy method, it is just for explanation purposes.

And since the server handles hypermedia controls (with a `_link` attribute in the responses), in our user ProfileCard, we can have an optional button that can be displayed if a relation to a delete method exists:
 
```tsx
{(user.isRelationAvailable("http://myVoc.org/#rel/delete")) ? <Button onClick={() => deleteUser(user)}>delete User</Button> : ""}
```

and a method like this one in our UserService:
```ts
  async deleteUser(user) {
      const deleteOperation = user.
          getRelation("http://myVoc.org/#rel/delete")//get the relations to a delete operation
          .map(relation => {
              if(relation instanceof Array) {
                  return relation[0].operation
              }
              return relation.operation
          })//gets the operation of the delete
          .getOrThrow(
              () =>
                  new Error('The REST API operation to delete a todo is not available')
          )
          
      const response = await deleteOperation.invoke()//invoke the delete operation, without having to specify the id
      return response.data;
  }
```
Some other minor changes need to be made in order for this to work, but this can get you an idea of what is possible with this approach.


A working implementation of this can be found in the branch `original-implementations/use-with-pivo`

### Conclusion

This is a new paradigm and a new way of developing a UI, but it allows for a better maintainability and less time-consuming changes to be made, especially in the long run.

Now that you have the basics, You are now ready to start to the study, Head back to https://github.com/CharlyReux/evolvable-by-design-research/tree/master/experiments/crossover-developers-study/experimentation/README.md to get started. 



