const firebase = require('@firebase/testing');
const MY_PROJECT_ID = "nekonarabe-app";

const db = firebase.initializeTestApp({projectId: MY_PROJECT_ID}).firestore();
exports.db = db;

const fv = firebase.firestore.FieldValue
exports.fv = fv;

const ft = firebase.firestore.Timestamp
exports.ft = ft;

exports.drawCard = async(playerRef, dealerRef) => {
  const batch = db.batch();
  const deck = (await dealerRef.get()).data().deck;
  batch.update(dealerRef, {deck: fv.arrayRemove(deck[0])});
  batch.update(playerRef, {hand: fv.arrayUnion(deck[0])});
  await batch.commit()
}

const judgeTypes = exports.judgeTypes = (card) => {
  return Object.values(card)[0][3]
}

const sortTypes = exports.sortTypes = (handCards, ribbons, buchis, shimas, fish, dokan) => {
  handCards.forEach(async(card) => {
    if (judgeTypes(card) === "r") {
      ribbons.push(card)
    } else if (judgeTypes(card) === "b") {
      buchis.push(card)
    } else if (judgeTypes(card) === "s") {
      shimas.push(card)
    } else if (judgeTypes(card) === "f") {
      fish.push(card)
    } else if (judgeTypes(card) === "d") {
      dokan.push(card)
    }
  })
}

const hasHeadAndTail = exports.hasHeadAndTail = (types) => {
  let head = false
  let tail = false
  types.forEach((card) => {
    if (Object.values(card)[0][1] === "h") {head = true}
    if (Object.values(card)[0][2] === "t") {tail = true}
  })
  return head && tail
}

const addHead = exports.addHead = (types, completeCat) => {
  if (hasHeadAndTail(types)) {
    let i = 0;
    types.forEach((card) => {
      if (Object.values(card)[0][1] === "h") {
        if (completeCat.length == 0) {
          completeCat.push(card)
          types.splice(i,1)
        }
      }
      i++
    })
  }
}

const addBody = exports.addBody = (types, completeCat, n) => {
  let i = 0;
  types.forEach((card) => {
    if (completeCat.length == n && Object.values(card)[0][2] != "t" && Object.values(card)[0][1] != "h") {
      const lastCard = completeCat[n - 1]
      if (Object.values(card)[0][1] === Object.values(lastCard)[0][2] || Object.values(lastCard)[0][2] === "a") {
        completeCat.push(card)
        types.splice(i,1)
      }
    }
    i++
  })
}

const addTail = exports.addTail = (types, completeCat, n) => {
  let i = 0;
  types.forEach((card) => {
    if (completeCat.length == n && Object.values(card)[0][2] == "t") {
      const lastCard = completeCat[n - 1]
      if (Object.values(card)[0][1] === Object.values(lastCard)[0][2] || Object.values(lastCard)[0][2] === "a") {
        completeCat.push(card)
        types.splice(i,1)
      }
    }
    i++
  })
}

exports.createCompleteCat = (handCards) => {
  const ribbons = [];
  const buchis = [];
  const shimas = [];
  const fish = [];
  const dokan = [];
  const completeRibbonCat = [];
  const completeBuchiCat = [];
  const completeShimaCat = [];
  sortTypes(handCards, ribbons, buchis, shimas, fish, dokan)
  const set = [[ribbons, completeRibbonCat], [buchis, completeBuchiCat], [shimas, completeShimaCat]]
  set.forEach((type) => {
    addHead(type[0], type[1]);
    addBody(type[0], type[1], 1);
    addTail(type[0], type[1], 2);
  })
  let complete;
  if (completeRibbonCat.length == 3) {
    complete = completeRibbonCat
  } else if (completeBuchiCat.length == 3) {
    complete = completeBuchiCat
  } else if (completeShimaCat.length == 3) {
    complete = completeShimaCat
  } 
  else {
    set.forEach((type) =>{
      addBody(dokan, type[1], 2);
      addTail(type[0], type[1], 3);
    })
    if (completeRibbonCat.length == 4) {
      complete = completeRibbonCat
    } else if (completeBuchiCat.length == 4) {
      complete = completeBuchiCat
    } else if (completeShimaCat.length == 4) {
      complete = completeShimaCat
    } else {complete = []}
  }
  return complete
}
