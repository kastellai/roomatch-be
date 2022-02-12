# roomatch-back

[Roomatch API Services - Home](../README.md)

Main end-points:
- `/users`
- [`/rooms`](./DOC_ROOMS.md)

# /users

## GET `/users`

Request `Payload` : not required

Response `Payload` for `200 Status Code`: 
```json
[
    {
        "iam": {
            "lgbtq": 0,
            "multicultural": 0,
            "pet_owner": 0,
            "veg": 0,
            "party_lover": 0,
            "smooker": 0
        },
        "roomId": {
            "friendlyWith": {
                "lgbtq": 1,
                "multicultural": 1,
                "pet_owner": 2,
                "veg": 1,
                "party_lover": 1,
                "smooker": 1
            },
            "roomId": "6203d6796....",
            "roomType": "Private",
            "city": "Palermo",
            "town": "Bagheria",
            "roomPhotos": "https://....",
            "wholikesme": [],
            "ilike": [],
        },
        "_id": "6203da6be........",
        "name": "FirstName",
        "surname": "LastName",
        "email": "usermail@gmail.com",
        "gender": "M",
        "age": 18,
        "ilike": [
            "6203d6796250e....",
            "6203d66b6250e....",
            "620509b119b5....."
        ],
        "wholikesme": [],
        "city": "Palermo",
        "town": "Bagheria",
        "photo": "https://....",
        "__v": 0
    },
    { ... },
    { ... },
    { ... }
]
```

## GET `/users/:id`

Query params: target `id`

Request `Payload` : not required

Response `Payload` for `200 Status Code`:
```json
{
    "iam": {
        "lgbtq": 0,
        "multicultural": 0,
        "pet_owner": 0,
        "veg": 0,
        "party_lover": 0,
        "smooker": 0
    },
    "roomId": {
        "friendlyWith": {
            "lgbtq": 1,
            "multicultural": 1,
            "pet_owner": 2,
            "veg": 1,
            "party_lover": 1,
            "smooker": 1
        },
        "roomId": "6203d6796....",
        "roomType": "Private",
        "city": "Palermo",
        "town": "Bagheria",
        "roomPhotos": "https://....",
        "wholikesme": [],
        "ilike": [],
    },
    "_id": "6203da6be........",
    "name": "FirstName",
    "surname": "LastName",
    "email": "usermail@gmail.com",
    "gender": "M",
    "age": 18,
    "ilike": [
        "6203d6796250e....",
        "6203d66b6250e....",
        "620509b119b5....."
    ],
    "wholikesme": [],
    "city": "Palermo",
    "town": "Bagheria",
    "photo": "https://....",
    "__v": 0
}
```


## POST `/users`

Query params: none

Request `Payload` : `json payload` following the `User` model

```json
{
    "name": { type: String, required: true },
    "surname": { type: String, required: true },
    "email": { type: String, required: true },
    "password": { type: String, required: true, select: false },
    "gender": { type: String, required: true, enum: ["Female", "Male", "Other"] },
    "age": { type: Number, required: true },
    "iam": {
        "lgbtq": Number,
        "multicultural": Number,
        "pet_owner": Number,
        "veg": Number,
        "party_lover": Number,
        "smooker": Number,
    },
    "ilike": [String],
    "wholikesme": [String],
    "city": { type: String, required: true },
    "town": { type: String, required: true },
    "photo": { type: String, required: true },
    "roomId": {
        "roomId": String,
        "roomType": String,
        "city": String,
        "town": String,
        "roomPhotos": String,
        "friendlyWith": {
            "lgbtq": Number,
            "multicultural": Number,
            "pet_owner": Number,
            "veg": Number,
            "party_lover": Number,
            "smooker": Number,
        },
        "wholikesme": [String],
        "ilike": [String],
    },
}
    
```

Response `Payload` for `201 Status Code`: 
```json
{
    "message": "record successfully created"
}
```


## PATCH `/users/:id`
Query params: target `id`

Request `Payload` :

```json

[
    { 
        "propName" : "keyName", 
        "value" : "newValue"
    },
    { .. }
]
    
```
For example: 
```json
[
    {
        "propName": "city",
        "value": "Verona"
    },
    {
        "propName": "town",
        "value": "Illasi"
    }
]
```

Response `Payload` for `200 Status Code`: 
```json
{
    ...
}
```


## PATCH `/users/:id/addlike`
Query params: target `id` is the target user is receiving the like

Request `Payload` : contains my `roomId.roomId` and my `roomId.ilike` updated with the new user I like (`:id`)

```json
 {
    "roomId": "6207a2c3a5f3c.......",
    "roomilike": [
        "620631eb445d.......", 
        "6206343355d5.......",
        "<new :id>"
    ]
  }
    
```


Response `Payload` for `200 Status Code`: the current user updated
```json
{
    "iam": {
        "lgbtq": 0,
        "multicultural": 0,
        "pet_owner": 0,
        "veg": 0,
        "party_lover": 0,
        "smooker": 0
    },
    "roomId": {
        "friendlyWith": {
            "lgbtq": 1,
            "multicultural": 1,
            "pet_owner": 2,
            "veg": 1,
            "party_lover": 1,
            "smooker": 1
        },
        "roomId": "6207a2c3a5f3c.......", 
        "roomType": "Private",
        "city": "Palermo",
        "town": "Bagheria",
        "roomPhotos": "https://....",
        "wholikesme": [],
        "ilike":  [
            "620631eb445d.......", 
            "6206343355d5.......",
            "<new :id>" // new user added in my ilike key for room
        ],
    },
    "_id": "6203da6be........",
    "name": "FirstName",
    "surname": "LastName",
    "email": "usermail@gmail.com",
    "gender": "M",
    "age": 18,
    "ilike": [
        "6203d6796250e....",
        "6203d66b6250e....",
        "620509b119b5....."
    ],
    "wholikesme": [],
    "city": "Palermo",
    "town": "Bagheria",
    "photo": "https://....",
}
```



## PATCH `/users/:id/removelike`
Query params: target `id` is the target user from who remove the like

Request `Payload` : contains my `roomId.roomId` and my `roomId.ilike` updated without the user I dislike (`:id`)

```json
 {
    "roomId": "6207a2c3a5f3c.......",
    "roomilike": [
        "620631eb445d.......", 
        "6206343355d5.......",
        "<new :id>" // this value must be removed from the roomilike array
    ]
  }
    
```


Response `Payload` for `200 Status Code`: the current user updated
```json
{
    "iam": {
        "lgbtq": 0,
        "multicultural": 0,
        "pet_owner": 0,
        "veg": 0,
        "party_lover": 0,
        "smooker": 0
    },
    "roomId": {
        "friendlyWith": {
            "lgbtq": 1,
            "multicultural": 1,
            "pet_owner": 2,
            "veg": 1,
            "party_lover": 1,
            "smooker": 1
        },
        "roomId": "6207a2c3a5f3c.......", 
        "roomType": "Private",
        "city": "Palermo",
        "town": "Bagheria",
        "roomPhotos": "https://....",
        "wholikesme": [],
        "ilike":  [
            "620631eb445d.......", 
            "6206343355d5.......",
           // "<new :id>" // this userId won't be present anymore in this array
        ],
    },
    "_id": "6203da6be........",
    "name": "FirstName",
    "surname": "LastName",
    "email": "usermail@gmail.com",
    "gender": "M",
    "age": 18,
    "ilike": [
        "6203d6796250e....",
        "6203d66b6250e....",
        "620509b119b5....."
    ],
    "wholikesme": [],
    "city": "Palermo",
    "town": "Bagheria",
    "photo": "https://....",
}
```

## GET `/users/:id/wholikesmyroom`
Query params: target `id` is the current user

Request `Payload` : not required

Response `Payload` for `200 Status Code`: the current users list interested in my room
```json
[
    {
        "iam": {
            "lgbtq": 0,
            "multicultural": 1,
            "pet_owner": 1,
            "veg": 0,
            "party_lover": 1,
            "smooker": 0
        },
        "city": "Caserta",
        "town": "Caserta",
        "photo": "https://...",
        "age": 32,
        "name": "Frank",
        "surname": "Matano",
        "gender": "M"
    }, 
    { ... },
    { ... }
]
```