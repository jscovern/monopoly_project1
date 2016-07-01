$(document).ready(function(){
	function Player(playerNum, textColor, backgroundColor) {
		this.name = "Player"+playerNum;
		this.playerID = playerNum;
		this.marker = "P"+playerNum;
		this.color = textColor;
		this.background_color = backgroundColor;
		this.money = 1500;
		this.propertyCount = 0;
		this.monopolyCount = 0;
		this.railRoadCount = 0;
		this.utilityCount = 0;
		this.onCommChest = false;
		this.onChance = false;
		this.inJail = false;
		this.getOutOfJailFreeCount = 0;
		this.currBoardPosition = 1;
		this.prevBoardPosition = 1;
		this.propertiesArray = [];
		this.hasRolled = false;
	}

	Player.prototype = {
		buyRailRoad: function() {
			this.railRoadCount += 1;
		},
		buyProperty: function(property) {
			this.propertyCount += 1;
			this.propertiesArray.push(property);
			this.money -= property.price;
			if(property.monopolyGroup==="Railroad") {
				this.buyRailRoad();
				property.updateRailRoadRent(this.railRoadCount);
			} else if (property.monopolyGroup==="Utility") {
				this.buyUtility();
			}
		},
		buyUtility: function() {
			this.utilityCount += 1;
		},
		getOutOfJailFree: function(type) {
			if(type==="use" && this.getOutOfJailFreeCount >= 1) {
				this.getOutOfJailFreeCount -= 1;
			}else if (type==="use" && this.getOutOfJailFreeCount < 1) {
				alert("You do not have any Get out of Jail Free Cards to use!");
			}
			else {
				this.getOutOfJailFreeCount += 1;
			}
		},
		calcPlayerPosition: function(diceObj,gamePlayObj) {
			var totalRoll = diceObj.die1Value + diceObj.die2Value;
			var newPosition;
			if (this.currBoardPosition + totalRoll === gamePlayObj.propertyCount) {
				newPosition = this.currBoardPosition + totalRoll;
			} else {
				newPosition = (this.currBoardPosition + totalRoll) % gamePlayObj.propertyCount;				
			}
			this.prevBoardPosition = this.currBoardPosition;
			this.currBoardPosition = newPosition;
			return newPosition;
		},
		payRent: function(rent,gamePlayObj) {
			this.money -= rent;
			gamePlayObj.otherPlayerObj.money += rent;
		},
		payIncomeTax: function() {
			var incomeTaxObj;
			if(this.money * 0.10 > 200) {
				incomeTaxObj = {
					option: "flat-fee",
					amount: 200
				};
			} else {
				incomeTaxObj = {
					option: "10%",
					amount: this.money * 0.10
				};
			}
			this.money -= incomeTaxObj.amount;
			return incomeTaxObj;
		},
		earnFromBank: function(amount) {
			this.money += amount;
		},
		payToBank: function(amount) {
			this.money -= amount;
		},
		startTurn: function(htmlBoardObj,gamePlayObj) {

			$(".dice").on("click",function() {
				gamePlayObj.makeMove(htmlBoardObj);
			});
			htmlBoardObj.nextPlayerMessage(gamePlayObj);
		},
		checkForBankruptcy: function(htmlBoardObj) {
			if(this.money < 0) {
				htmlBoardObj.addBankruptcyMessage();
				$("#nextPlayerTurn").off("click");
				$(".dice").off("click");
			}
		},
	};

	function Property(propID,title,group,price,housePrice,rent) {
		this.propertyID = propID;
		this.title = title;
		this.monopolyGroup = group;
		this.ownedBy="";
		this.price=price;
		this.baseRent=rent;
		this.currentRent=rent; //this and baserent start the same, but currentRent can increase if housecount>0
		this.houseCount = 0;
	}

	Property.prototype = {
		addOwner: function(currPlayerObj) {
			this.ownedBy = currPlayerObj;
		},
		updateRailRoadRent: function(numOwned) {
			switch (numOwned) {
				case 1: 
					this.currentRent = 25; 
					break;
				case 2: 
					this.currentRent = 50; 
					break;
				case 3: 
					this.currentRent = 100; 
					break;
				case 4: 
					this.currentRent = 200; 
					break;
				default:
					console.log("uhh ohh, something went wrong here.  You shouldn't be here");
			}
		},
		calcUtilityRent: function(ownerUtilityCount,totalRoll) {
			var multiplier;
			if(ownerUtilityCount == 1) {
				multiplier = 4;
			} else {
				multiplier = 10;
			}
			return multiplier * totalRoll;
		},
	};

	function MonopolyGroup(group,propertyCount,housePrice) {
		this.monopolyGroup = group;
		this.propertyCount = propertyCount;
		this.housePrice = housePrice;
	}

	MonopolyGroup.prototype = {

	};

	function GamePlay() {
		this.playerCount = 0;
		this.propertyCount = 0;
		this.currPlayerObj = {};
		this.otherPlayerObj = {};
		this.communityChestArray = [];
		this.communityChestArrayCounter = 0;
	}

	GamePlay.prototype = {
		incrementPlayerID: function() {
			this.playerCount += 1;
			return this.playerCount;
		},
		incrementPropertyCount: function() {
			this.propertyCount += 1;
			return this.propertyCount;
		},
		rollDice: function() {
			var diceObj = {
				die1Value: Math.ceil(Math.random()*6),
				die2Value: Math.ceil(Math.random()*6),
				die1Rotation: Math.ceil(Math.random()*360),
				die2Rotation: Math.ceil(Math.random()*360),
			};
			return diceObj;
		},
		toggleCurrPlayerObj: function(htmlBoardObj) {
			if(this.currPlayerObj.playerID === undefined || this.currPlayerObj.playerID === 2) {
				this.currPlayerObj = player1;
				this.otherPlayerObj = player2;
			} else {
				this.currPlayerObj = player2;
				this.otherPlayerObj = player1;
			}
			this.currPlayerObj.hasRolled = false;
			this.currPlayerObj.startTurn(htmlBoardObj,this);
		},
		makeMove: function(htmlBoardObj) {
			$(".dice").off("click");
			this.currPlayerObj.hasRolled = true;
			var currPlayerObj = this.currPlayerObj;
			if(currPlayerObj.inJail) {
				if(currPlayerObj.getOutOfJailFreeCount > 0) {
					currPlayerObj.getOutOfJailFree("use");
					htmlBoardObj.sprungJailMessage("card",this);
					this.currPlayerObj.getOutOfJailFreeCount -= 1;
					this.currPlayerObj.inJail = false;
				} else if(currPlayerObj.money >= 50) {
					currPlayerObj.payToBank(50);
					htmlBoardObj.sprungJailMessage("paid",this);
					this.currPlayerObj.inJail = false;
				} else {
					htmlBoardObj.stuckInJailMessage(this);
					return;
				}
			}
			var diceObj = htmlBoardObj.updateHTMLDice(this);
			var newPosition = currPlayerObj.calcPlayerPosition(diceObj,this);
			htmlBoardObj.drawPlayerMarker(currPlayerObj,newPosition);
			htmlBoardObj.addMoveMessage(this);
			var currProperty = this.landOnProperty(htmlBoardObj);
			this.gamePlayOnThisProperty(currProperty,htmlBoardObj);
		},
		forceMove: function(htmlBoardObj, newPosition) {
			var currPlayerObj = this.currPlayerObj;
			htmlBoardObj.drawPlayerMarker(currPlayerObj,newPosition);
			this.currPlayerObj.prevBoardPosition = this.currPlayerObj.currBoardPosition;
			this.currPlayerObj.currBoardPosition = newPosition;
		},
		landOnProperty: function(htmlBoardObj) {
			var currPlayer = this.currPlayerObj;
			var propArray = htmlBoardObj.propertiesArray;
			var currProperty = propArray[currPlayer.currBoardPosition - 1];
			return currProperty;
		},
		gamePlayOnThisProperty: function(property,htmlBoardObj) {
			if (property.title==="Go") {
				this.currPlayerObj.earnFromBank(200);
				htmlBoardObj.addLandOnGoMessage(this);
			} else if(property.ownedBy==="" && typeof property.price ==="number" && property.price>0 && property.price <= this.currPlayerObj.money) {
				//unowned property, and curr player has enough money to buy it
				htmlBoardObj.addBuyMessage(this,property,htmlBoardObj);
			} else if (property.ownedBy==="" && typeof property.price ==="number" && property.price>0 && property.price > this.currPlayerObj.money) {
				//unowned property, and curr player doesn't have enough money to buy it
				htmlBoardObj.addInsufficientFundsMessage(this,property);
			} else if (property.ownedBy.playerID !== this.currPlayerObj.playerID && property.currentRent <= this.currPlayerObj.money && property.monopolyGroup!=="Utility") {
				//property owned by other player, you have enough money to pay rent
				htmlBoardObj.addPayRentMessage(this, property);
			} else if (property.ownedBy.playerID !== this.currPlayerObj.playerID && property.currentRent > this.currPlayerObj.money && property.monopolyGroup!=="Utility") {
				//property owned by other player, you don't have enough money to pay rent
				htmlBoardObj.addLoserMessage(this, property);
			} else if (property.ownedBy.playerID !== this.currPlayerObj.playerID && property.monopolyGroup==="Utility") {
				//property is a utility, and is owned by the other player
				var rent = property.calcUtilityRent(this.otherPlayerObj.utilityCount,this.rollDice().die1Value + this.rollDice().die2Value);
				if(rent <= this.currPlayerObj.money) { //you have enough money to pay the rent
					htmlBoardObj.addPayUtilityMessage(this, property,rent);
				} else { //you don't have enough to pay the utility
					htmlBoardObj.addCantPayUtilityMessage(this, property,rent);
				}
			} else if (property.ownedBy.playerID === this.currPlayerObj.playerID) {
				//you already own the property you landed on
				htmlBoardObj.youAlreadyOwnThis();
			} else if (property.monopolyGroup === "Income Tax") {
				var utilityObj = this.currPlayerObj.payIncomeTax();
				htmlBoardObj.incomeTaxMessage(utilityObj,this);
			} else if (property.title === "Com Chest") {
				this.commChestHandler(this.communityChestArray[this.communityChestArrayCounter],htmlBoardObj);
			} else if (property.title==="Go To Jail") {
				this.currPlayerObj.inJail = true;
				this.forceMove(htmlBoardObj,11);
				htmlBoardObj.goToJailMessage("");
			} else if (property.title==="Chance") {
				htmlBoardObj.chanceMessage(this);
				this.commChestHandler(this.communityChestArray[this.communityChestArrayCounter],htmlBoardObj);
			} else {
				htmlBoardObj.nothingHappensMessage(this);
			}
		},
		incrementCommChestCounter: function() {
			if(this.communityChestArrayCounter === this.communityChestArray.length - 1) {
				this.communityChestArrayCounter = 0;
			} else {
				this.communityChestArrayCounter+=1;
			}
		},
		commChestHandler: function(commChestObj,htmlBoardObj) {
			htmlBoardObj.commChestInstructionsMessage(commChestObj);
			if(commChestObj.move) {
				htmlBoardObj.commChestMoveMessage(commChestObj);
				this.forceMove(htmlBoardObj,commChestObj.moveToPropNum);
			}
			if(commChestObj.getOutOfJailFreeFlag) {
				this.currPlayerObj.getOutOfJailFree("add");
				htmlBoardObj.commChestGetOutJailFreeMessage(commChestObj,this.currPlayerObj.getOutOfJailFreeCount);
			}
			if(commChestObj.goToJailFlag) {
				this.currPlayerObj.inJail = true;
				htmlBoardObj.goToJailMessage(commChestObj);
			}
			if(commChestObj.earnOrPay==="earn") {
				this.currPlayerObj.earnFromBank(commChestObj.amount);
				htmlBoardObj.commChestEarnMessage(commChestObj,this);
			} else if (commChestObj.earnOrPay === "pay") {
				this.currPlayerObj.payToBank(commChestObj.amount);
				htmlBoardObj.commChestPayMessage(commChestObj,this);
			}
			this.incrementCommChestCounter();
		},
		startGame: function(htmlBoardObj,currPlayer) {
			htmlBoardObj.createHTMLBoard(player1,player2);
			this.currPlayerObj = currPlayer;
			var myGamePlayObj = this;
			currPlayer.startTurn(htmlBoardObj,this);
			$("#nextPlayerTurn").on("click",function(){
				if(myGamePlayObj.currPlayerObj.hasRolled === false) {
					htmlBoardObj.didntRollMessage(myGamePlayObj);
				} else {
					myGamePlayObj.currPlayerObj.checkForBankruptcy(htmlBoardObj);
					htmlBoardObj.addPlayerBreak();
					myGamePlayObj.toggleCurrPlayerObj(htmlBoardObj);
				}
			});
		},
	};

	function HTMLBoard() {
		this.propertiesArray = [];
	}

	HTMLBoard.prototype = {
		addToBoardArray: function(propertyObj) {
			this.propertiesArray.push(propertyObj);
		},
		createHTMLBoard: function(p1,p2) {
			for(var i=0; i<this.propertiesArray.length; i++){
				var propNum = i+1;
				$("#prop"+propNum+" .monopolyGroup").text(this.propertiesArray[i].title);
				$("#prop"+propNum+" .monopolyGroup").addClass(this.propertiesArray[i].monopolyGroup);
			}
			this.drawPlayerMarker(p1,1);
			this.drawPlayerMarker(p2,1);
		},
		drawPlayerMarker: function(playerObj,propNum) {
			var str;
			$("#"+playerObj.marker).remove(); //removes current marker, before drawing new one
			if($("#prop"+propNum+" .players").html()==="") {
				str = "<span id="+playerObj.marker+">"+playerObj.marker+"</span>";
			} else {
				str = $("#prop"+propNum+" .players").html()+" <span id="+playerObj.marker+">"+playerObj.marker+"</span>";
			}
			$("#prop"+propNum+" .players").html(str);
			for (var i=0; i<10; i++) {
				$("#"+playerObj.marker).toggle("pulsate");
			}
		},
		updateHTMLDice: function(gamePlayObj) {
			var diceObj = gamePlayObj.rollDice();
			$("#dice1").text(diceObj.die1Value);
			$("#dice2").text(diceObj.die2Value);
			$("#dice1").css("transform","Rotate("+diceObj.die1Rotation+"deg)");
			$("#dice2").css("transform","Rotate("+diceObj.die2Rotation+"deg)");
			var rollAmt = diceObj.die1Value + diceObj.die2Value;
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+" you rolled a "+diceObj.die1Value+" and a "+diceObj.die2Value+" for a total of "+rollAmt+"</div>");
			this.scrollToBottomMessages();
			return diceObj;
		},
		addMoveMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+", you have landed on "+gamePlayObj.landOnProperty(this).title+"</div>");
			this.scrollToBottomMessages();
		},
		addOwnerStyling: function(property,gamePlayObj,htmlBoardObj) {
			$("#prop"+property.propertyID+" .players").css("background-color",gamePlayObj.currPlayerObj.background_color);
		},
		addBuyMessage: function(gamePlayObj,currProperty,htmlBoardObj) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by the bank, so you can buy it! It will cost $"+currProperty.price+" Would you like to?</div>");
			$("#messageBoard").append("<div class='yesNoButton'><button id='yesButton' class='btn btn-success'>Yes</button><button id='noButton' class='btn btn-danger'>No</button></div>");
			htmlBoardObj.scrollToBottomMessages();
			$("#yesButton").on("click",function(){
				//check if they have a monopoly now
				gamePlayObj.currPlayerObj.buyProperty(currProperty);
				currProperty.addOwner(gamePlayObj.currPlayerObj);
				htmlBoardObj.addOwnerStyling(currProperty,gamePlayObj,this);
				$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+", congratulations! You have just bought "+currProperty.title+" for $"+currProperty.price+". You now own "+gamePlayObj.currPlayerObj.propertyCount+" properties. You have $"+gamePlayObj.currPlayerObj.money+" left</div>");
				$(".yesNoButton").remove();
				htmlBoardObj.scrollToBottomMessages();
			});
			$("#noButton").on("click",function(){
				$('#messageBoard').append("<div class='message'>"+gamePlayObj.currPlayerObj.name+", you chose not to buy the property. Questionable.</div>");
				$(".yesNoButton").remove();
				htmlBoardObj.scrollToBottomMessages();
			});
		},
		addInsufficientFundsMessage: function(gamePlayObj,currProperty) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by the bank, but you do not have enough money to buy it.  It costs $"+currProperty.price+" and you only have $"+gamePlayObj.currPlayerObj.money+"</div>");
			this.scrollToBottomMessages();
		},
		addPayRentMessage: function(gamePlayObj,currProperty) {
			gamePlayObj.currPlayerObj.payRent(currProperty.currentRent,gamePlayObj);
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", you must pay them rent of $"+currProperty.currentRent+" since the property has "+currProperty.houseCount+" houses on it. You now have $"+gamePlayObj.currPlayerObj.money+" left, and "+gamePlayObj.otherPlayerObj.name+" has $"+gamePlayObj.otherPlayerObj.money+"</div>");
			this.scrollToBottomMessages();
		},
		addLoserMessage: function(gamePlayObj,currProperty) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", and you don't have the $"+currProperty.currentRent+" for rent! You only have $"+gamePlayObj.currPlayerObj.money+" left.  Therefore, you lose!</div>");
			this.scrollToBottomMessages();
		},
		addPayUtilityMessage: function(gamePlayObj,currProperty,rent) {
			gamePlayObj.currPlayerObj.payRent(rent,gamePlayObj);
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", since it's a utility and they own "+gamePlayObj.otherPlayerObj.utilityCount+" utilities, you owe them rent of $"+rent+". You now have $"+gamePlayObj.currPlayerObj.money+" left, and "+gamePlayObj.otherPlayerObj.name+" has $"+gamePlayObj.otherPlayerObj.money+"</div>");
			this.scrollToBottomMessages();
		},
		addCantPayUtilityMessage: function(gamePlayObj,currProperty,rent) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", since it's a utility and they own "+gamePlayObj.otherPlayerObj.utilityCount+" utilities, you owe them rent of $"+rent+".  You only have $"+gamePlayObj.currPlayerObj.money+" left.  Therefore, you lose!</div>");			
			this.scrollToBottomMessages();
		},
		youAlreadyOwnThis: function() {
			$("#messageBoard").append("<div class='message'>You already own this!  Let's move the game along!</div>");						
			this.scrollToBottomMessages();
		},
		incomeTaxMessage: function(incomeTaxObj, gamePlayObj) {
			$("#messageBoard").append("<div class='message'>You landed on Income Tax, and thus owe the Bank.  The cheapest option for you was the "+incomeTaxObj.option+", for $"+incomeTaxObj.amount+". You have $"+gamePlayObj.currPlayerObj.money+" left.</div>");
			this.scrollToBottomMessages();
		},
		commChestInstructionsMessage: function(commChestObj) {
			$("#messageBoard").append("<div class='message'>Your community chest card states: "+commChestObj.instructions+"</div>");
			this.scrollToBottomMessages();
		},
		commChestMoveMessage: function(commChestObj) {
			$("#messageBoard").append("<div class='message'>Based on this card, you are moving to "+this.propertiesArray[commChestObj.moveToPropNum - 1].title+"</div>");
			this.scrollToBottomMessages();
		},
		commChestGetOutJailFreeMessage: function(commChestObj,getOutOfJailFreeCount) {
			$("#messageBoard").append("<div class='message'>Congratulations, you got a Get Out of Jail Free Card! You now have "+getOutOfJailFreeCount+" of them to use</div>");
			this.scrollToBottomMessages();
		},
		goToJailMessage: function(commChestObj) {
			$("#messageBoard").append("<div class='message'>Sorry buddy, you're in jail now!</div>");
			this.scrollToBottomMessages();
		},
		commChestEarnMessage(commChestObj,gamePlayObj) {
			$("#messageBoard").append("<div class='message'> "+gamePlayObj.currPlayerObj.name+" You've earned $"+commChestObj.amount+" from the bank for this community chest card. You now have $"+gamePlayObj.currPlayerObj.money+"</div>");
			this.scrollToBottomMessages();
		},
		commChestPayMessage(commChestObj,gamePlayObj) {
			$("#messageBoard").append("<div class='message'> "+gamePlayObj.currPlayerObj.name+" You've paid the bank $"+commChestObj.amount+" for this community chest card. You now have $"+gamePlayObj.currPlayerObj.money+"</div>");
			this.scrollToBottomMessages();
		},
		sprungJailMessage(type,gamePlayObj) {
			if(type==="card"){
				var str = "using a get out of jail free card";
			} else {
				var str = "paying $50";
			}
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+" you have sprung jail!  You did it by "+str+". You have $"+gamePlayObj.currPlayerObj.money+" left</div>");
			this.scrollToBottomMessages();
		},
		stuckInJailMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+" you are stuck in jail, because you don't have the $50! You currently have $"+gamePlayObj.currPlayerObj.money+"</div>");
			this.scrollToBottomMessages();
		},
		chanceMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+", sorry! I don't have any chance logic yet, so, here's a community chest card instead</div>");
			this.scrollToBottomMessages();
		},
		nothingHappensMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+": I don't think anything happens on this type of property.  That is all.</civ>");
			this.scrollToBottomMessages();
		},
		nextPlayerMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+": You're Up! Click the die to roll!</div>");
			$(".yesNoButton").remove();
			this.scrollToBottomMessages();
		},
		addLandOnGoMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+" you landed on Go!  How does $200 sound? You now have $"+gamePlayObj.currPlayerObj.money+"</div>");
			this.scrollToBottomMessages();
		},
		scrollToBottomMessages: function() {
			document.getElementById("messageBoard").scrollTop = document.getElementById("messageBoard").scrollHeight+200;
		},
		didntRollMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+"! Ummmm, you didn't roll.  Go first, then switch players!</div>");
			this.scrollToBottomMessages();
		},
		addBankruptcyMessage: function() {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+"! Dude, you lost! Game Over!</div>");
		},
		addPlayerBreak: function() {
			$("#messageBoard").append("<div class='message lineBreak'>----------------</div>");
		}
	};

	function CommunityChest(instructions, amount, earnOrPay, move, moveToPropNum, getOutOfJailFreeFlag, goToJailFlag) {
		this.instructions = instructions;
		this.amount = amount;
		this.earnOrPay = earnOrPay;
		this.move = move;
		this.moveToPropNum = moveToPropNum;
		this.getOutOfJailFreeFlag = getOutOfJailFreeFlag;
		this.goToJailFlag = goToJailFlag;
		this.numForOrder = Math.random()*Math.random();
	}

	CommunityChest.prototype = {

	};


		//GamePlay
	var monopGame = new GamePlay();
	//communityChest
	monopGame.communityChestArray.push(new CommunityChest("XMAS Fund Matures. Collect $100",100,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("You inherit $100",100,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("From sale of stock you get $45",45,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Bank error in your favor, collect $200",200,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Pay hospital $100",100,"pay",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Doctors fee, pay $50",50,"pay",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Get out of Jail Free","","","","",true));
	monopGame.communityChestArray.push(new CommunityChest("Receive for services, $25",25,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Pay school tax of $150",150,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Advance to go (collect $200)",200,"earn",true,1,false));
	monopGame.communityChestArray.push(new CommunityChest("You have won 2nd prize in a beauty contest, collect $10",10,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Collect $50 from the bank",50,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Income Tax refund, collect $20",20,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Life Insurance Matures, collect $100",100,"earn",false,"",false));
	monopGame.communityChestArray.push(new CommunityChest("Go to jail. Go directly to jail. Do not pass go.","","",true,11,false,true));

	//players
	var player1 = new Player(monopGame.incrementPlayerID(),"black","yellow");
	var player2 = new Player(monopGame.incrementPlayerID(),"red","black");
	//MonopolyGroups
	var monopGroupPurple = new MonopolyGroup("Purple",2,50);
	var monopGroupLightBlue = new MonopolyGroup("LightBlue",3,50);
	var monopGroupMaroon = new MonopolyGroup("Maroon",3,100);
	var monopGroupOrange = new MonopolyGroup("Orange",3,100);
	var monopGroupRed = new MonopolyGroup("Red",3,150);
	var monopGroupYellow = new MonopolyGroup("Yellow",3,150);
	var monopGroupGreen = new MonopolyGroup("Green",3,200);
	var monopGroupBlue = new MonopolyGroup("Blue",2,200);
	//HTMLBoard
	var monopBoard = new HTMLBoard();
	//Properties
	var go = new Property(monopGame.incrementPropertyCount(),"Go","","","","");
	monopBoard.addToBoardArray(go);
	var mediteranean = new Property(monopGame.incrementPropertyCount(),"Medit Ave","Purple",60,50,2);
	monopBoard.addToBoardArray(mediteranean);
	var commChest1 = new Property(monopGame.incrementPropertyCount(),"Com Chest","","","");
	monopBoard.addToBoardArray(commChest1);
	var baltic = new Property(monopGame.incrementPropertyCount(),"Baltic Ave","Purple",80,50,4);
	monopBoard.addToBoardArray(baltic);
	var incTax = new Property(monopGame.incrementPropertyCount(),"Income Tax","Income Tax","","");
	monopBoard.addToBoardArray(incTax);
	var reading = new Property(monopGame.incrementPropertyCount(),"Readng RR","Railroad",200,25);
	monopBoard.addToBoardArray(reading);
	var oriental = new Property(monopGame.incrementPropertyCount(),"Oriental Av","LightBlue",100,50,6);
	monopBoard.addToBoardArray(oriental);
	var chance1 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance1);
	var vermont = new Property(monopGame.incrementPropertyCount(),"Vt Ave","LightBlue",100,50,6);
	monopBoard.addToBoardArray(vermont);
	var connecticut = new Property(monopGame.incrementPropertyCount(),"Conn. Ave","LightBlue",120,50,8);
	monopBoard.addToBoardArray(connecticut);
	var jail = new Property(monopGame.incrementPropertyCount(),"Jail","","","");
	monopBoard.addToBoardArray(jail);
	var stCharles = new Property(monopGame.incrementPropertyCount(),"St Charles","Maroon",140,100,10);
	monopBoard.addToBoardArray(stCharles);
	var electric = new Property(monopGame.incrementPropertyCount(),"Electric Co","Utility",150,"","Utility");
	monopBoard.addToBoardArray(electric);
	var states = new Property(monopGame.incrementPropertyCount(),"States Ave","Maroon",140,100,10);
	monopBoard.addToBoardArray(states);
	var virginia = new Property(monopGame.incrementPropertyCount(),"Virginia Ave","Maroon",140,100,12);
	monopBoard.addToBoardArray(virginia);
	var pennsylvaniaRR = new Property(monopGame.incrementPropertyCount(),"Penn. RR","Railroad",200,25);
	monopBoard.addToBoardArray(pennsylvaniaRR);
	var stJames = new Property(monopGame.incrementPropertyCount(),"St James","Orange",120,100,14);
	monopBoard.addToBoardArray(stJames);
	var commChest2 = new Property(monopGame.incrementPropertyCount(),"Com Chest","","","");
	monopBoard.addToBoardArray(commChest2);
	var tennessee = new Property(monopGame.incrementPropertyCount(),"TN Ave","Orange",120,100,14);
	monopBoard.addToBoardArray(tennessee);
	var ny = new Property(monopGame.incrementPropertyCount(),"NY Ave","Orange",120,100,16);
	monopBoard.addToBoardArray(ny);
	var freeParking = new Property(monopGame.incrementPropertyCount(),"Free Park","","","");
	monopBoard.addToBoardArray(freeParking);
	var kentucky = new Property(monopGame.incrementPropertyCount(),"KY Ave","Red",120,150,18);
	monopBoard.addToBoardArray(kentucky);
	var chance3 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance3);
	var indiana = new Property(monopGame.incrementPropertyCount(),"Indiana Ave","Red",120,150,18);
	monopBoard.addToBoardArray(indiana);
	var illinois = new Property(monopGame.incrementPropertyCount(),"Illinois Ave","Red",120,150,20);
	monopBoard.addToBoardArray(illinois);
	var bo = new Property(monopGame.incrementPropertyCount(),"B&O Rail","Railroad",200,25);
	monopBoard.addToBoardArray(bo);
	var atlantic = new Property(monopGame.incrementPropertyCount(),"Atlantic Ave","Yellow",260,150,22);
	monopBoard.addToBoardArray(atlantic);
	var ventnor = new Property(monopGame.incrementPropertyCount(),"Ventnor Av","Yellow",260,150,22);
	monopBoard.addToBoardArray(ventnor);
	var waterWorks = new Property(monopGame.incrementPropertyCount(),"Water Work","Utility",150,"","Utility");
	monopBoard.addToBoardArray(waterWorks);
	var marvin = new Property(monopGame.incrementPropertyCount(),"Marvin Grd","Yellow",280,150,24);
	monopBoard.addToBoardArray(marvin);
	var goToJail = new Property(monopGame.incrementPropertyCount(),"Go To Jail","","","");
	monopBoard.addToBoardArray(goToJail);
	var pacific = new Property(monopGame.incrementPropertyCount(),"Pacific Ave","Green",300,200,26);
	monopBoard.addToBoardArray(pacific);
	var nc = new Property(monopGame.incrementPropertyCount(),"N.C. Ave","Green",300,200,26);
	monopBoard.addToBoardArray(nc);
	var commChest3 = new Property(monopGame.incrementPropertyCount(),"Com Chest","","","");
	monopBoard.addToBoardArray(commChest3);
	var pennsylvania = new Property(monopGame.incrementPropertyCount(),"Penn. Ave","Green",320,200,28);
	monopBoard.addToBoardArray(pennsylvania);
	var shortLine = new Property(monopGame.incrementPropertyCount(),"Short Line","Railroad",200,25);
	monopBoard.addToBoardArray(shortLine);
	var chance2 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance2);
	var parkPlace = new Property(monopGame.incrementPropertyCount(),"Park Pl","Blue",350,200,35);
	monopBoard.addToBoardArray(parkPlace);
	var luxTax = new Property(monopGame.incrementPropertyCount(),"Luxury Tax","Luxury Tax","",75);
	monopBoard.addToBoardArray(luxTax);	
	var boardwalk = new Property(monopGame.incrementPropertyCount(),"Board Walk","Blue",400,200,50);
	monopBoard.addToBoardArray(boardwalk);
	
	monopGame.startGame(monopBoard,player1);
});