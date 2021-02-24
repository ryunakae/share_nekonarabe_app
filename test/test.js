const assert = require('assert');
const firebase = require('@firebase/testing');

const MY_PROJECT_ID = "nekonarabe-app";

beforeEach(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
})

describe("nekonarabe app", () => {
  const db = firebase.initializeTestApp({projectId: MY_PROJECT_ID}).firestore();
  
  describe("cards", () => {
    const cards = db.collection("cards");
    const successfulCard = {
      points: 1,
      front: "p_ink",
      back: "p_ink",
      cardType: "r_ibbon",
      initiality: false
    }

    it("Can create successful card", async() => {
      await firebase.assertSucceeds(cards.doc('1_p_p_r_n').set(successfulCard))
    });

    describe("unsuccessful card", () => {
      const unsuccessfulCard = successfulCard

      it("Can't create too big point card", async() => {
        unsuccessfulCard.points = 3;
        await firebase.assertFails(cards.doc('3_p_p_r_n').set(unsuccessfulCard));
        unsuccessfulCard.points = 1;
      });

      it("Can't create too small point card", async() => {
        unsuccessfulCard.points = -1;
        await firebase.assertFails(cards.doc('-1_p_p_r_n').set(unsuccessfulCard));
        unsuccessfulCard.points = 1;
      });

      it("Can't create card with wrong frot", async() => {
        unsuccessfulCard.front = "t_ail"
        await firebase.assertFails(cards.doc('1_t_p_r_n').set(unsuccessfulCard))
        unsuccessfulCard.front = "p_ink"
      });

      it("Can't create card with wrong back", async() => {
        unsuccessfulCard.back = "x_xx"
        await firebase.assertFails(cards.doc('1_p_x_r_n').set(unsuccessfulCard))
        unsuccessfulCard.back = "p_ink"
      });

      it("Can't create card with wrong cardType", async() => {
        unsuccessfulCard.cardType = "x_xx"
        await firebase.assertFails(cards.doc('1_p_p_x_n').set(unsuccessfulCard))
        unsuccessfulCard.cardType = "r_ibbon"
      });

      it("Can't create card without initiality", async() => {
        unsuccessfulCard.initiality = null
        await firebase.assertFails(cards.doc('1_p_p_r_n').set(unsuccessfulCard))
        unsuccessfulCard.initiality = false
      });

      it("Can't create card with wrong points and ID", async() => {
        await firebase.assertFails(cards.doc('2_p_p_r_n').set(unsuccessfulCard));
      });

      it("Can't create card with wrong front and ID", async() => {
        await firebase.assertFails(cards.doc('1_h_p_r_n').set(unsuccessfulCard));
      });

      it("Can't create card with wrong back and ID", async() => {
        await firebase.assertFails(cards.doc('1_p_t_r_n').set(unsuccessfulCard));
      });

      it("Can't create card with wrong cardType and ID", async() => {
        await firebase.assertFails(cards.doc('1_p_p_b_n').set(unsuccessfulCard));
      });

      it("Can't create card with wrong initiality and ID", async() => {
        await firebase.assertFails(cards.doc('1_p_p_r_i').set(unsuccessfulCard));
      });
    });
  });

  describe("tables", () => {
    describe("deck", () => {
      const successfulDeckCard = {}
      it("Can have successful cards", async() => {
        await firebase.assertSucceeds(db.collection("tables").doc('uid').set(successfulDeckCard))
      });
    });
    const successfulTable = {

    }
    it("Can create successful table", async() => {
      await firebase.assertSucceeds(db.collection("tables").doc('uid').set(successfulTable))
    });
  });
});

after(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
})
