const assert = require('assert');
const firebase = require('@firebase/testing');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const testFunc = require('./functions.js');

const MY_PROJECT_ID = "nekonarabe-app";

// beforeEach(async() => {
//   await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
// })

describe("nekonarabe app", () => {
  const db = testFunc.db;
  const fv = testFunc.fv;
  const ft = testFunc.ft;
  
  describe("cards", () => {
    const cards = db.collection("cards");
    const successfulCard = {
      points: 1,
      front: "pink",
      back: "pink",
      cardType: "ribbon",
      initiality: false
    }

    it("Can create successful card", async() => {
      await firebase.assertSucceeds(cards.doc('1pprn').set(successfulCard))
    });

    describe("unsuccessful card", () => {
      const unsuccessfulCard = successfulCard;
      beforeEach(async() => {
        await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
      })

      it("Can't create too big point card", async() => {
        unsuccessfulCard.points = 3;
        await firebase.assertFails(cards.doc('3pprn').set(unsuccessfulCard));
        unsuccessfulCard.points = 1;
      });

      it("Can't create too small point card", async() => {
        unsuccessfulCard.points = -1;
        await firebase.assertFails(cards.doc('-1pprn').set(unsuccessfulCard));
        unsuccessfulCard.points = 1;
      });

      it("Can't create card with wrong frot", async() => {
        unsuccessfulCard.front = "tail"
        await firebase.assertFails(cards.doc('1tprn').set(unsuccessfulCard))
        unsuccessfulCard.front = "pink"
      });

      it("Can't create card with wrong back", async() => {
        unsuccessfulCard.back = "xxx"
        await firebase.assertFails(cards.doc('1pxrn').set(unsuccessfulCard))
        unsuccessfulCard.back = "pink"
      });

      it("Can't create card with wrong cardType", async() => {
        unsuccessfulCard.cardType = "xxx"
        await firebase.assertFails(cards.doc('1ppxn').set(unsuccessfulCard))
        unsuccessfulCard.cardType = "ribbon"
      });

      it("Can't create card without initiality", async() => {
        unsuccessfulCard.initiality = null
        await firebase.assertFails(cards.doc('1pprn').set(unsuccessfulCard))
        unsuccessfulCard.initiality = false
      });

      it("Can't create card with wrong points and ID", async() => {
        await firebase.assertFails(cards.doc('2pprn').set(unsuccessfulCard));
      });

      it("Can't create card with wrong front and ID", async() => {
        await firebase.assertFails(cards.doc('1hprn').set(unsuccessfulCard));
      });

      it("Can't create card with wrong back and ID", async() => {
        await firebase.assertFails(cards.doc('1ptrn').set(unsuccessfulCard));
      });

      it("Can't create card with wrong cardType and ID", async() => {
        await firebase.assertFails(cards.doc('1ppbn').set(unsuccessfulCard));
      });

      it("Can't create card with wrong initiality and ID", async() => {
        await firebase.assertFails(cards.doc('1ppri').set(unsuccessfulCard));
      });
    });
  });

  describe("game flow", () => {
    const tableRef = db.collection("tables").doc();
    const dealerRef = tableRef.collection("players").doc("dealer");
    const random3 = () => Math.floor( Math.random() * 3 );
    const initialHeads = [
      {0: '0hari'}, {0: '0habi'}, {0: '0hasi'}
    ]
    const initialTails = [
      {1: '0atri'}, {1: '0atbi'}, {1: '0atsi'}
    ]

    let ryu;
    it("Create table", async() => {
      tableRef.set({createdAt: ft.now(), updatedAt: ft.now(),})
      const batch = db.batch();
      batch.set(dealerRef, {name: 'dealer'});
      const playerRef = tableRef.collection("players").doc();
      batch.set(playerRef, {name: 'Ryu', role: 'host', hand: [initialHeads[random3()], initialTails[random3()]], player: true});
      ryu = playerRef
      await firebase.assertSucceeds(batch.commit())
      assert((await dealerRef.get()).exists && (await playerRef.get()).exists)
    })

    let ken;
    it("Add new player before choose deck", async() => {
      await firebase.assertSucceeds(tableRef.collection("players")
        .add({name: 'Ken', role: 'guest', hand: [initialHeads[random3()], initialTails[random3()]], player: true}))
        .then((playerRef) => {
          ken = playerRef
          tableRef.update({updatedAt: ft.now()})
        })
      assert((await ken.get()).exists)
    })
    
    const sampleDeck = [
      '0hprn', '0hprn', '0hpbn', '0hpbn', '0hpsn', '0hpsn',
      '0hwrn', '0hwrn', '0hwbn', '0hwbn', '0hwsn', '0hwsn',
      '0aadn', '0aadn', '1aadn', '1aadn', '1aadn',
      '1pprn', '1ppbn', '1ppsn', '1wwrn', '1wwbn', '1wwsn',
      '1pwrn', '1pwrn', '1pwbn', '1pwbn', '1pwsn', '1pwsn',
      '1wprn', '1wprn', '1wpbn', '1wpbn', '1wpsn', '1wpsn',
      '2pprn', '2ppbn', '2ppsn', '2wwrn', '2wwbn', '2wwsn',
      '2pwrn', '2pwbn', '2pwsn', '2wprn', '2wpbn', '2wpsn',
      '0ptrn', '0ptbn', '0ptsn', '0wtrn', '0wtbn', '0wtsn',
      '0atrn', '0atbn', '0atsn', '1hhfn', '1hhfn'
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
      await firebase.assertSucceeds(dealerRef.update({deck: deck})
                                      .then(() => {tableRef.update({updatedAt: ft.now()})})
                                    )
      assert(tableRef.collection("player").orderBy("deck"))
    })

    let gin;
    it("Add new player after choose deck", async() => {
      await firebase.assertSucceeds(tableRef.collection("players")
        .add({name: 'Gin', role: 'guest', hand: [initialHeads[random3()], initialTails[random3()]], player: true}))
        .then((playerRef) => {
          gin = playerRef
          tableRef.update({updatedAt: ft.now()})
        })
    })

    it("Deal first three cards", async() => {
      const batch = db.batch()
      const deck = (await dealerRef.get()).data().deck;
      const players = await tableRef.collection("players").where("player","==",true).get();
      let i = 0
      players.forEach((player) => {
        batch.update(dealerRef, {deck: fv.arrayRemove(deck[i], deck[i + 1], deck[i + 2])});
        batch.update(player.ref, {hand: fv.arrayUnion(deck[i], deck[i + 1], deck[i + 2])});
        i += 3
      })
      await firebase.assertSucceeds(batch.commit()
                                      .then(() => {tableRef.update({updatedAt: ft.now()})})
                                    )
    })

    it("Open two cards", async() => {
      const deck = (await dealerRef.get()).data().deck;
      await firebase.assertSucceeds(
        dealerRef.update({
          deck: fv.arrayRemove(deck[0], deck[1]),
          opens: fv.arrayUnion(deck[0], deck[1])
        })
        .then(() => {tableRef.update({updatedAt: ft.now()})})
      )
    })
    
    it ("draw a card from deck", async() => {
      const batch = db.batch()
      const deck = (await dealerRef.get()).data().deck;
      const playerRef = ryu;
      batch.update(dealerRef, {deck: fv.arrayRemove(deck[0])});
      batch.update(playerRef, {hand: fv.arrayUnion(deck[0])});
      await firebase.assertSucceeds(batch.commit()
                                      .then(() => {tableRef.update({updatedAt: ft.now()})})
                                    )
    })

    it ("draw a card from opens", async() => {
      const batch = db.batch();
      const opens = (await dealerRef.get()).data().opens;
      const deck = (await dealerRef.get()).data().deck;
      const playerRef = ken;
      const chosen = 1;
      batch.update(dealerRef, {opens: fv.arrayRemove(opens[chosen])});
      batch.update(playerRef, {hand: fv.arrayUnion(opens[chosen])});
      batch.update(dealerRef, {opens: fv.arrayUnion(deck[0]), deck: fv.arrayRemove(deck[0])})
      await firebase.assertSucceeds(batch.commit()
                                      .then(() => {tableRef.update({updatedAt: ft.now()})})
                                    )
    })

    it ("keap drawing cards from deck for 14 loops", async() => {
      for (let i = 0; i < 14; i++) {
        await testFunc.drawCard(gin, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})});
        await testFunc.drawCard(ryu, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})});
        await testFunc.drawCard(ken, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})});
      }
      await firebase.assertSucceeds(testFunc.drawCard(gin, dealerRef)
                                      .then(() => {tableRef.update({updatedAt: ft.now()})})
                                    )
    })

    it ("play first head card", async() => {
      const hand = (await ryu.get()).data().hand;
      await firebase.assertSucceeds(ryu.update({hand: fv.arrayRemove(hand[0]), cat1: fv.arrayUnion(hand[0])})
                                      .then(() => {tableRef.update({updatedAt: ft.now()})})
                                    )
    })

    it ("create a complete cat and proceed game till finish", async() => {
      const kenHand = (await ken.get()).data().hand;
      const ginHand = (await gin.get()).data().hand;
      if (testFunc.createCompleteCat(kenHand).length > 2) {
        const completeCat = testFunc.createCompleteCat(kenHand)
        completeCat.forEach((catPart) => {
          ken.update({hand: fv.arrayRemove(catPart), cat1: fv.arrayUnion(catPart)})
        })
        await testFunc.drawCard(gin, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})})
        await testFunc.drawCard(ryu, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})})
      } else {
        await testFunc.drawCard(ken, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})})
        if (testFunc.createCompleteCat(ginHand).length > 2) {
          const completeCat = testFunc.createCompleteCat(ginHand)
          completeCat.forEach((catPart) => {
            gin.update({hand: fv.arrayRemove(catPart), cat1: fv.arrayUnion(catPart)})
              .then(() => {tableRef.update({updatedAt: ft.now()})})
          })
          await testFunc.drawCard(ryu, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})})
        } else {
          await testFunc.drawCard(gin, dealerRef).then(() => {tableRef.update({updatedAt: ft.now()})})
        }
      }
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
