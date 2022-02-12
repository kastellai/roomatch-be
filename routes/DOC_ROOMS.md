# roomatch-back

[Roomatch API Services - Home](../README.md)

Main end-points:
- [`/users`](./DOC_USERS.md)
- `/rooms`

# /rooms

## GET `/rooms`

Request `Payload` : not required

Response `Payload` for `200 Status Code`: 
```json
[
   {.. }
    { ... },
    { ... },
    { ... }
]
```

## GET `/rooms/:id`

Query params: target room `id`

Request `Payload` : not required

Response `Payload` for `200 Status Code`:
```json
{
   
}
```


## POST `/rooms`

Query params: none

Request `Payload` : `json payload` following the `Room` model

```json
{
  "roomOwner": ObjectId,
  "roomType": { type: String, required: true, enum: ["Private", "Shared"] },
  "roomAddress": { type: String, required: true },
  "city": { type: String, required: true },
  "town": { type: String, required: true },
  "roomPhotos": { type: [String], required: true, length: 8 },
  "roommates": {
    "females": Number,
    "males": Number,
  },
  "friendlyWith": {
    "lgbtq": Number,
    "multicultural": Number,
    "pet_owner": Number,
    "veg": Number,
    "party_lover": Number,
    "smooker": Number,
  },
  "ilike": [String],
  "wholikesme": [String],
}
    
```

Response `Payload` for `201 Status Code`: 
```json
{
    "message": "record successfully created"
}
```


## PATCH `/rooms/:id`
Query params: target room `id`

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

Response `Payload` for `200 Status Code`: returns the room record updated
```json
{
    ...
}
```


## PATCH `/rooms/:id/addlike`
Query params: target `id` is the target room is receiving the like

Request `Payload` : contains my `userId` and my `ilike` updated with the new room I like (`:id`)

```json
 {
    "userId": "6207a2c3a5f3c.......",
    "ilike": [
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
            "lgbtq": 0,
            "multicultural": 0,
            "pet_owner": 0,
            "veg": 0,
            "party_lover": 0,
            "smooker": 0
        },
        "roomId": "", 
        "roomType": "",
        "city": "",
        "town": "",
        "roomPhotos": "",
        "wholikesme": [],
        "ilike":  [],
    },
    "_id": "6207a2c3a5f3c.......",
    "name": "FirstName",
    "surname": "LastName",
    "email": "usermail@gmail.com",
    "gender": "M",
    "age": 18,
    "ilike": [
        "620631eb445d.......", 
        "6206343355d5.......",
        "<new :id>" // new room id I like
    ],
    "wholikesme": [],
    "city": "Palermo",
    "town": "Bagheria",
    "photo": "https://....",
}
```



## PATCH `/rooms/:id/removelike`
Query params: target `id` is the target user from who remove the like

Request `Payload` : contains my `userId` and my `ilike` updated without the room I dislike (`:id`)

```json
 {
    "userId": "6207a2c3a5f3c.......",
    "ilike": [
        "620631eb445d.......", 
        "6206343355d5.......",
        "<new :id>" // this value must be removed from the ilike array
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
            "lgbtq": 0,
            "multicultural": 0,
            "pet_owner": 0,
            "veg": 0,
            "party_lover": 0,
            "smooker": 0
        },
        "roomId": "", 
        "roomType": "",
        "city": "",
        "town": "",
        "roomPhotos": "",
        "wholikesme": [],
        "ilike":  [],
    },

    "_id": "6207a2c3a5f3c.......",
    "name": "FirstName",
    "surname": "LastName",
    "email": "usermail@gmail.com",
    "gender": "M",
    "age": 18,
   "ilike": [
        "620631eb445d.......", 
        "6206343355d5.......",
        // "<new :id>" // this roomId won't be present anymore in this array    
    ],
    "wholikesme": [],
    "city": "Palermo",
    "town": "Bagheria",
    "photo": "https://....",
}
```

## GET `/rooms/:id/getlikes`
Query params: target `id` is the current room

Request `Payload` : not required

Response `Payload` for `200 Status Code`: the current users list interested in this room
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