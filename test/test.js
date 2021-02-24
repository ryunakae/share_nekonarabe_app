const assert = require('assert');
const firebase = require('@firebase/testing');

const MY_PROJECT_ID = "nekonarabe-app";

// beforeEach(async() => {
//   await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
// })

describe("nekonarabe app", () => {
  const db = firebase.initializeTestApp({projectId: MY_PROJECT_ID}).firestore();
  const fv = firebase.firestore.FieldValue
  
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
      const unsuccessfulCard = successfulCard;
      beforeEach(async() => {
        await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
      })

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

  describe("game flow", () => {
    const tableRef = db.collection("tables").doc()
    const initialHeads = [
      '0_h_a_r_i', '0_h_a_r_i', '0_h_a_b_i', '0_h_a_b_i', '0_h_a_s_i', '0_h_a_s_i',
      '0_h_a_r_i', '0_h_a_r_i', '0_h_a_b_i', '0_h_a_b_i', '0_h_a_s_i', '0_h_a_s_i',
    ]
    const initialTails = [
      '0_a_t_r_i', '0_a_t_r_i', '0_a_t_b_i', '0_a_t_b_i', '0_a_t_s_i', '0_a_t_s_i',
      '0_a_t_r_i', '0_a_t_r_i', '0_a_t_b_i', '0_a_t_b_i', '0_a_t_s_i', '0_a_t_s_i',
    ]

    it("Create table", async() => {
      const batch = db.batch();
      const dealer = tableRef.collection("players").doc("dealer");
      batch.set(dealer, {name: 'dealer', initialHeadCards: initialHeads, initialTailCards: initialTails});
      const player1 = tableRef.collection("players").doc();
      batch.set(player1, {name: 'Ryu', role: 'host'});
      await firebase.assertSucceeds(batch.commit())
    })

    it("Add new player before choose deck", async() => {
      await firebase.assertSucceeds(tableRef.collection("players").doc().set({name: 'Ken', role: 'guest'}))
    })
    
    const sampleDeck = [
      '0_h_p_r_n', '0_h_p_r_n', '0_h_p_b_n', '0_h_p_b_n', '0_h_p_s_n', '0_h_p_s_n',
      '0_h_w_r_n', '0_h_w_r_n', '0_h_w_b_n', '0_h_w_b_n', '0_h_w_s_n', '0_h_w_s_n',
      '0_a_a_d_n', '0_a_a_d_n', '1_a_a_d_n', '1_a_a_d_n', '1_a_a_d_n',
      '1_p_p_r_n', '1_p_p_b_n', '1_p_p_s_n', '1_w_w_r_n', '1_w_w_b_n', '1_w_w_s_n',
      '1_p_w_r_n', '1_p_w_r_n', '1_p_w_b_n', '1_p_w_b_n', '1_p_w_s_n', '1_p_w_s_n',
      '1_w_p_r_n', '1_w_p_r_n', '1_w_p_b_n', '1_w_p_b_n', '1_w_p_s_n', '1_w_p_s_n',
      '2_p_p_r_n', '2_p_p_b_n', '2_p_p_s_n', '2_w_w_r_n', '2_w_w_b_n', '2_w_w_s_n',
      '2_p_w_r_n', '2_p_w_b_n', '2_p_w_s_n', '2_w_p_r_n', '2_w_p_b_n', '2_w_p_s_n',
      '0_p_t_r_n', '0_p_t_b_n', '0_p_t_s_n', '0_w_t_r_n', '0_w_t_b_n', '0_w_t_s_n',
      '0_a_t_r_n', '0_a_t_b_n', '0_a_t_s_n', '1_h_h_f_n', '1_h_h_f_n'
    ]

    it("Choose deck", async() => {
      let deck = []
      sampleDeck.forEach((card) => {
        const randomNum = Math.floor( Math.random() * 1000000000000 );
        cardSet = {[randomNum]: card}
        deck.push(cardSet)
      })
      function compare(a, b) {
        const numA = Object.keys(a)
        const numB = Object.keys(b)
        let comparison = 0
        if (numA > numB) {
          comparison = 1
        } else {
          comparison = -1
        }
        return comparison
      }
      deck.sort(compare)
      await firebase.assertSucceeds(tableRef.collection("players").doc("dealer").update({deck: deck}))

    })

    it("Add new player after choose deck", async() => {
      await firebase.assertSucceeds(tableRef.collection("players").doc().set({name: 'Gin', role: 'guest'}))
    })

    it("Deal initial cards", async() => {
      
    })

  });

  // describe("tables", () => {
  //   const table = db.collection("tables").doc("sampleTable")
  //   describe("deck", () => {
  //     const initialCards = [
  //       '0_h_a_r_i', '0_h_a_r_i', '0_h_a_b_i', '0_h_a_b_i', '0_h_a_s_i', '0_h_a_s_i',
  //       '0_a_t_r_i', '0_a_t_r_i', '0_a_t_b_i', '0_a_t_b_i', '0_a_t_s_i', '0_a_t_s_i',
  //     ]
  //     const sampleDeck = [
  //       '0_h_p_r_n', '0_h_p_r_n', '0_h_p_b_n', '0_h_p_b_n', '0_h_p_s_n', '0_h_p_s_n',
  //       '0_h_w_r_n', '0_h_w_r_n', '0_h_w_b_n', '0_h_w_b_n', '0_h_w_s_n', '0_h_w_s_n',
  //       '0_a_a_d_n', '0_a_a_d_n', '1_a_a_d_n', '1_a_a_d_n', '1_a_a_d_n',
  //       '1_p_p_r_n', '1_p_p_b_n', '1_p_p_s_n', '1_w_w_r_n', '1_w_w_b_n', '1_w_w_s_n',
  //       '1_p_w_r_n', '1_p_w_r_n', '1_p_w_b_n', '1_p_w_b_n', '1_p_w_s_n', '1_p_w_s_n',
  //       '1_w_p_r_n', '1_w_p_r_n', '1_w_p_b_n', '1_w_p_b_n', '1_w_p_s_n', '1_w_p_s_n',
  //       '2_p_p_r_n', '2_p_p_b_n', '2_p_p_s_n', '2_w_w_r_n', '2_w_w_b_n', '2_w_w_s_n',
  //       '2_p_w_r_n', '2_p_w_b_n', '2_p_w_s_n', '2_w_p_r_n', '2_w_p_b_n', '2_w_p_s_n',
  //       '0_p_t_r_n', '0_p_t_b_n', '0_p_t_s_n', '0_w_t_r_n', '0_w_t_b_n', '0_w_t_s_n',
  //       '0_a_t_r_n', '0_a_t_b_n', '0_a_t_s_n', '1_h_h_f_n', '1_h_h_f_n'
  //     ]
  //   });

  //   describe("players", () => {
  //     const successfullyCreatedPlayer = {
  //       name: "Ryu"
  //     }
  //     it("Can create successful player", async() => {
  //       await firebase.assertSucceeds(table.collection("players").doc('player1').set(successfullyCreatedPlayer))
  //     });

  //     it("Player can draw initial cards", async() => {
  //       await firebase.assertSucceeds(table.collection("players").doc('player1').update({
  //         hand: [{00000001: '0_h_a_r_i'}, {0000002: '0_a_t_b_i'}]
  //       }))
  //     });

  //     it("Player can draw a card", async() => {
  //       await firebase.assertSucceeds(table.collection("players").doc('player1').update({
  //         hand: fv.arrayUnion({0000003: '1_p_p_s_n'})
  //       }))
  //     });

  //     it("Player can draw a card", async() => {
  //       await firebase.assertSucceeds(table.collection("players").doc('player1').update({
  //         hand: fv.arrayUnion({0000004: '1_p_p_s_n'})
  //       }))
  //     });
  //   });

  //   const successfulTable = {

  //   }
  //   it("Can create successful table", async() => {
  //     await firebase.assertSucceeds(db.collection("tables").doc('uid').set(successfulTable))
  //   });
  // });
});

// after(async() => {
//   await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
// })
