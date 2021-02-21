# official_nekonarabe-app

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### schema
cards:
  docID: string = //initial character of each params eg. 1pprn
  points: enum = [1,2,3]
  front: enum = ["head","pink","water","almighty"]
  back: enum = ["tail","pink","water","almighty","head"]
  cardType: enum = ["ribbon","buchi","shima","fish","dokan"]
  initiality: boolean

table:
  docID: string = uuid
  deck:
    cardID: string = uuid
    symbol: enum = [cards.id]
    position: tuple:[number,number,number] = [n<=#ofPlayers,x<=x+1,y>yE(x,y)]
  players:
    playerID: string = uuid
    name: string = //username or choose before game
    hand: number = //# of cards in his/her hand
    