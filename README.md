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
```
cards:
  docID: string = //initial character of each params eg. 1pprn
  points: enum = [0,1,2]
  front: enum = ["h_ead","p_ink","w_ater","a_lmighty"]
  back: enum = ["t_ail","p_ink","w_ater","a_lmighty","h_ead"]
  cardType: enum = ["r_ibbon","b_uchi","s_hima","f_ish","d_okan"]
  initiality: boolean

table:
  docID: string = uuid
  deck:
    cardID: string = uuid
    symbol: enum = [cards.id]
    position: tuple:[number,number,number] = [n<=#ofPlayers,x<=x+1,y>yE(x,y)]
  players:
    playerID: string = player_1,2,3...
    name: string = //username or choose before game
    hand: number = //# of cards in his/her hand
    cat_x: array = [...deck.symbol]
```