const assert = require('assert');
const firebase = require('@firebase/testing');

const MY_PROJECT_ID = "nekonarabe-app";

beforeEach(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
})

describe("nekonarabe app", () => {
  
  it("first test", () => {
    assert.equal(2+2, 4);
  });

  describe("cards", () => {
    const db = firebase.initializeTestApp({projectId: MY_PROJECT_ID}).firestore();
    const successfulCard = {
      points: 1,
      front: "pink",
      back: "pink",
      cardType: "ribbon",
      initiality: false
    }

    it("Can create successfull card", async() => {
      await firebase.assertSucceeds(db.collection("cards").doc('1pprn').set(successfulCard))
    });

    describe("unsuccessfull card", () => {
      const cards = db.collection("cards");
      const unsuccessfullCard = successfulCard

      it("Can't create too big point card", async() => {
        unsuccessfullCard.points = 3;
        await firebase.assertFails(cards.doc('1pprn').set(unsuccessfullCard));
        unsuccessfullCard.points = 1;
      });

      it("Can't create too small point card", async() => {
        unsuccessfullCard.points = -1;
        await firebase.assertFails(cards.doc('1pprn').set(unsuccessfullCard));
        unsuccessfullCard.points = 1;
      });

      it("Can't create card with wrong frot", async() => {
        unsuccessfullCard.front = "tail"
        await firebase.assertFails(cards.doc('1pprn').set(unsuccessfullCard))
        unsuccessfullCard.front = "pink"
      });

      it("Can't create card with wrong back", async() => {
        unsuccessfullCard.back = "xxx"
        await firebase.assertFails(cards.doc('1pprn').set(unsuccessfullCard))
        unsuccessfullCard.back = "pink"
      });

      it("Can't create card with wrong cardType", async() => {
        unsuccessfullCard.cardType = "xxx"
        await firebase.assertFails(cards.doc('1pprn').set(unsuccessfullCard))
        unsuccessfullCard.cardType = "ribbon"
      });

      it("Can't create card without initiality", async() => {
        unsuccessfullCard.initiality = null
        await firebase.assertFails(cards.doc('1pprn').set(unsuccessfullCard))
        unsuccessfullCard.initiality = false
      });
    });
    

    // describe("point of card is in 0~2", () => {
    //   it("shoud take 0~2", async() => {
    //     const db = firebase.initializeTestApp({projectId: MY_PROJECT_ID}).firestore();
    //     const testDoc = db.collection("cards").doc('test').set({

    //     })
    //   });
    // });

    // it("front of card is in head, pink, water, or almighty", async() => {
    // });

    // it("back of card is in tail, pink, water, almighty, or head", async() => {
    // });

    // it("cardType is in ribbon, buchi, shima, fish, or dokan", async() => {
    // });

    // it("initiality of card is boolean", async() => {
    // });
  });
});

after(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
})
