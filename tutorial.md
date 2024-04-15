# Tutorial



## What is Pivo?
It has become common practice: we use RESTful APIs to access and manipulate data on frontend applications. And to build these frontends, we separate the logic of the view and navigation from the logic that makes the REST API calls. While the logic of the view is materialized through components, the logic of the interactions with the REST API is dispatched into services. For example, all the calls to the Issues on the Github API would be done in an IssueService.

But one issue arises, when the REST API changes, the front-end application is very likely to break. Something as little as changing the name of a field in a back-end can break a front-end implementation. Therefore, we devised an approach called *Pivo*, and a framework named Pivo with the purpose of tackling the co-evolution of the front-end with the back-end.  

## Example

The approach is based on the use of Semantic data and the OpenApi Specification to ensure that front-end does not break.
Here is an example of how it would look like in practice in a React application.

Let's say we have an application that displays card details, here is how it would look like implemented in a classical manner.
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
- A non-admin user is no allowed to delete a card anymore.

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
          x-@type: https://schema.org/Text
          x-@id: http://myVoc.org/vocab#cardName
          type: string
        id:
          x-@type: https://schema.org/identifier
          x-@id: http://myVoc.org/vocab#cardId
          type: integer
  parameters:
    id:
        in: path
        name: id
        description: the id of the card to be deleted
        required: true
        schema:
          x-@type: https://schema.org/identifier
          x-@id: http://myVoc.org/vocab#cardId
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
      <h1>{card.getOneValue('http://myVoc.org/vocab#cardName')}</h1>
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

This approach allows for a co-evolution of the front-end and the back-end, and covers the breaking changes we had discussed earlier.


## Do it yourself: Make an application *Evolvable-By-Design*

### Introduction
To get you started with the *Pivo* approach, you will be making a simple application to display informations about a user

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

### Displaying user informations

The goal of the application is simply to display user information when entering an id and pressing the button.

A simple UI is provided in [App.tsx](frontend/src/App.tsx), you can look around to see how it works. 
However the calls for the api is not setup yet, so requesting to the backend won't do much for now.


In the [Profile Service](frontend/src/services/ProfileService.ts), you can implement the getUserInfo() method with the following code:

```ts
async getUserInfo(userId: number): Promise<User> {
    const response = await axios.get(`${this.baseUrl}/users/${userId}`)
    if (response.status !== 200) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
    }
    return response.data as User;
}
```

Now save, and you should see that the user is indeed displayed in the app.

### Introducing a breaking change
We will now see how an update in the backend application can break our simple UI.

For some reason, the provider decided to add those changes in its rest API:
- Removed the createdAt field
- changed the /users/:id endpoint to /user/:id

In order to apply the changes, stop the backend, and run the new version of it, in `backend/v2`:
```sh
 cd ../v2
 npm install
 npm run dev
 ```

And you should see in your front-end that nothing works anymore.

In order to fix it, you now have to
- First, Change the endpoint used in the `getUserInfo()` method from `${this.baseUrl}/users/${userId}` to `${this.baseUrl}/user/${userId}`.
> The request does not throw an error, but the entire page gets broken, because the field createAt is not available anymore.
- To fix this, you need to change how the user is displayed, in the (ProfileCard)[frontend/src/Components/ProfileCard.tsx] component, remove the three lines that show the createdAt value(you might as well want to remove the createdAt field in the user model).

Now, your application should be working. Of course, these were simple evolutions in the backend that do not require many changes to be made. But this can quickly become a time consuming issue when the codeBase starts getting bigger, and maybe you haven't been maintaining the application for a while so it might take you some time to get back into it.

### Making the application *Evolvable-By-Design*

What if your application could evolve as the same time as the back-end, without anyone having to make the manual changes?

This is the idea of the *Pivo* library that we will now leverage to make our application resilient to changes.

In your front-end, run the following command:
```sh
npm i @evolvable-by-design/pivo
```

The documentation can be found [here](https://github.com/evolvable-by-design/pivo/tree/master/packages/pivo)

In order for the library to work, we need an enhanced openApi specification file that leverages semantic annotations, that is provided in each of the backend, let's take [this one](backend/v2/openapi.yml) to implement our approach. 

