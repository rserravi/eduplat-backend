# API for EDUPLAT Educative platform

Information on EDUPLAT on https://eduplat.org

## How to use

- run 'git clone ...'
- run 'npm start'

Note: Make sure you have nodemon is installed in your system otherwise you can install as a dev dependencies in the project

### (*) Open **rest.http** to see examples of *user*, *edusource* and *comment* objects and any Api call :+1

# API resources

### User API Resources

All the user API router follows '/v1/user/'

| #     | Routers                          | Verbs  | Progress | Is Private | Description                                      |
| ----- | -------------------------------- | ------ | -------- | ---------- | ------------------------------------------------ |
| 1     | '/v1/user/login'                 | POST   | DONE     | No         | Verify user authentication (login, password) and return JWT        |
| 2     | '/v1/user/google-login'          | POST   | DONE     | No         | Verify user authentication (from "credential", google JWT) and return JWT        |
| 3     | '/v1/user/google-registration'   | POST   | DONE     | No         | Create user extracting data from "credential" (google JWT)        |
| 4     | '/v1/user/reset-password'        | POST   | DONE     | No         | Verify email and email pin to reset the password, (from "email") |
| 5     | '/v1/user/reset-password'        | PATCH  | DONE     | No         | Replace with new password.   /(from "email", "pin", and "password")                    |
| 6     | '/v1/user/logout'                | DELETE | DONE     | Yes        | Delete user accessJWT.  From "authorization" in headers and "_id" in body              |
| 7     | '/v1/user/'                      | PATCH  | DONE     | Yes        | Patch user by Id.                           |
| 8     | '/v1/user/'                      | GET    | DONE     | Yes        | Get user info. Gets Id from middleware                                   |
| 9     | '/v1/user/'                      | POST   | DONE     | No         | Create an user (firstname, lastname, email, password)                                    |
| 10    | '/v1/user/verify'                | PATCH  | DONE     | No         | Check verification link, from "email", "randomUrl")                                    |

### EduSources Api Resources

All the edusources API follows '/v1/edusource'

| #     | Routers                          | Verbs  | Progress | Is Private | Description                                      |
| ----- | -------------------------------- | ------ | -------- | ---------- | ------------------------------------------------ |
| 1     | '/v1/edusource '                 | POST   | TODO     | No         | Create and edusource (json)        |
| 2     | '/v1/edusource/'                 | GET    | TODO     | No         | Get all the resources of logged user        |
| 3     | '/v1/edusource/{id}              | GET    | TODO     | No         | Get a single edusouce by id        |
| 4     | '/v1/edusource/{id}'             | PATCH  | TODO     | No         | Edit a edusource if pertains to user or superuser |
| 5     | '/v1/edusource/{id}'             | DELETE | TODO     | No         | Delete a edusource if pertains to user or superuser |
| 6     | '/v1/edusource/tags              | GET    | TODO     | No         | Get all tags                                    |
| 7     | '/v1/edusource/tags/{id}         | GET    | TODO     | No         | Get all edusources from this tag 
| 8     | '/v1/edusource/tags              | POST   | TODO     | No         | Create a tag                                       |
| 9     | '/v1/edusource/tags              | PATCH  | TODO     | No         | Update a tag                                       |
| 10    | '/v1/edusource/tags              | DELETE | TODO     | No         | Delete a tag                                       |
| 11     | '/v1/edusource/category         | GET    | TODO     | No         | Get all categories                                      |
| 12     | '/v1/edusource/category/{id}    | GET    | TODO     | No         | Get all edusources from this category by id               |
| 13     | '/v1/edusource/category         | POST   | TODO     | No         | Create a category                                       |
| 14     | '/v1/edusource/category         | PATCH  | TODO     | No         | Update a category                                       |
| 15     | '/v1/edusource/category         | DELETE | TODO     | No         | Delete a category                                       |
| 16     | '/v1/edusource/find             | GET    | TODO     | No         | Finds all edusources from a comma separated search terms json.


### Comment API Resources

All the user API router follows '/v1/comment/'

| #     | Routers                          | Verbs  | Progress | Is Private | Description                                      |
| ----- | -------------------------------- | ------ | -------- | ---------- | ------------------------------------------------ |
| 1     | '/v1/comment'                    | POST   | TODO     | No         | Create and post a comment, with fromId, toId, comment, date, etc        |
| 2     | '/v1/comment'                    | GET    | TODO     | No         | Get all comments from specified userId        |
| 2     | '/v1/comment/{id}'               | GET    | TODO     | No         | Get an specific comment from its Id        |
| 2     | '/v1/comment/{id}                | PATCH  | TODO     | No         | Update a comment from its Id if logged user or superuser        |
| 2     | '/v1/comment/{id}                | DELETE | TODO     | No         | Delete a comment from its Id if logged user or superuser        |
