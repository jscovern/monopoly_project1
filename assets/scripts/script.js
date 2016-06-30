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
			var newPosition = (this.currBoardPosition + totalRoll) % gamePlayObj.propertyCount;
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
		toggleCurrPlayerObj: function() {
			if(this.currPlayerObj.playerID === undefined || this.currPlayerObj.playerID === 2) {
				this.currPlayerObj = player1;
				this.otherPlayerObj = player2;
			} else {
				this.currPlayerObj = player2;
				this.otherPlayerObj = player1;
			}
		},
		makeMove: function(htmlBoardObj) {
			var currPlayerObj = this.currPlayerObj;
			var diceObj = htmlBoardObj.updateHTMLDice(this);
			console.log(currPlayerObj.playerID);
			var newPosition = currPlayerObj.calcPlayerPosition(diceObj,this);
			htmlBoardObj.drawPlayerMarker(currPlayerObj,newPosition);
			var currProperty = this.landOnProperty(htmlBoardObj);
			this.gamePlayOnThisProperty(currProperty,htmlBoardObj);
			htmlBoardObj.addMoveMessage(this);
			//this.toggleCurrPlayerObj();
		},
		landOnProperty: function(htmlBoardObj) {
			var currPlayer = this.currPlayerObj;
			var propArray = htmlBoardObj.propertiesArray;
			var currProperty = propArray[currPlayer.currBoardPosition - 1];
			return currProperty;
		},
		gamePlayOnThisProperty: function(property,htmlBoardObj) {
			console.log("prop owned by id: "+property.ownedBy.playerID);
			console.log("this currplayer obj id: "+this.currPlayerObj.playerID);
			console.log("property curr rent" + property.currentRent);
			console.log("currplayer obj money "+this.currPlayerObj.money);
			console.log("base rent "+property.baseRent);
			if(property.ownedBy==="" && typeof property.price ==="number" && property.price>0 && property.price <= this.currPlayerObj.money) {
				//unowned property, and curr player has enough money to buy it
				htmlBoardObj.addBuyMessage(this,property,htmlBoardObj);
				console.log("in the if");
			} else if (property.ownedBy==="" && typeof property.price ==="number" && property.price>0 && property.price > this.currPlayerObj.money) {
				//unowned property, and curr player doesn't have enough money to buy it
				htmlBoardObj.addInsufficientFundsMessage(this,property);
				console.log("in the first else-if");
			} else if (property.ownedBy.playerID !== this.currPlayerObj.playerID && property.currentRent <= this.currPlayerObj.money && property.monopolyGroup!=="Utility") {
				//property owned by other player, you have enough money to pay rent
				htmlBoardObj.addPayRentMessage(this, property);
				console.log("thin the second else-if");
			} else if (property.ownedBy.playerID !== this.currPlayerObj.playerID && property.currentRent > this.currPlayerObj.money && property.monopolyGroup!=="Utility") {
				//property owned by other player, you don't have enough money to pay rent
				htmlBoardObj.addLoserMessage(this, property);
				console.log("in the third else-if");
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
			}
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
			return diceObj;
		},
		addMoveMessage: function(gamePlayObj) {
			$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+", you have landed on "+gamePlayObj.landOnProperty(this).title+"</div>");
		},
		addOwnerStyling: function(property,gamePlayObj,htmlBoardObj) {
			$("#prop"+property.propNum).css("background-color",gamePlayObj.currPlayerObj.background_color);
		},
		addBuyMessage: function(gamePlayObj,currProperty,htmlBoardObj) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by the bank, so you can buy it! It will cost $"+currProperty.price+" Would you like to?</div>");
			$("#messageBoard").append("<div class='yesNoButton'><button id='yesButton'>Yes</button><button id='noButton'>No</button></div>");
			$("#yesButton").on("click",function(){
				$(".yesNoButton").addClass("hide");
				//check if they have a monopoly now
				gamePlayObj.currPlayerObj.buyProperty(currProperty);
				currProperty.addOwner(gamePlayObj.currPlayerObj);
				htmlBoardObj.addOwnerStyling(currProperty,gamePlayObj);
				$("#messageBoard").append("<div class='message'>"+gamePlayObj.currPlayerObj.name+", congratulations! You have just bought "+currProperty.title+" for $"+currProperty.price+". You now own "+gamePlayObj.currPlayerObj.propertyCount+" properties.</div>");
			});
		},
		addInsufficientFundsMessage: function(gamePlayObj,currProperty) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by the bank, but you do not have enough money to buy it.  It costs $"+currProperty.price+" and you only have $"+gamePlayObj.currPlayerObj.money+"</div>");
		},
		addPayRentMessage: function(gamePlayObj,currProperty) {
			gamePlayObj.currPlayerObj.payRent(currProperty.currentRent,gamePlayObj);
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", you must pay them rent of $"+currProperty.currentRent+" since the property has "+currProperty.houseCount+" houses on it. You now have $"+gamePlayObj.currPlayerObj.money+" left, and "+gamePlayObj.otherPlayerObj.name+" has $"+gamePlayObj.otherPlayerObj.money+"</div>");
		},
		addLoserMessage: function(gamePlayObj,currProperty) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", and you don't have the $"+currProperty.currentRent+" for rent! You only have $"+gamePlayObj.currPlayerObj.money+" left.  Therefore, you lose!</div>");
		},
		addPayUtilityMessage: function(gamePlayObj,currProperty,rent) {
			gamePlayObj.currPlayerObj.payRent(rent,gamePlayObj);
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", since it's a utility and they own "+gamePlayObj.otherPlayerObj.utilityCount+" utilities, you owe them rent of $"+rent+". You now have $"+gamePlayObj.currPlayerObj.money+" left, and "+gamePlayObj.otherPlayerObj.name+" has $"+gamePlayObj.otherPlayerObj.money+"</div>");
		},
		addCantPayUtilityMessage: function(gamePlayObj,currProperty,rent) {
			$("#messageBoard").append("<div class='message'>"+currProperty.title+" is currently owned by "+currProperty.ownedBy.name+", since it's a utility and they own "+gamePlayObj.otherPlayerObj.utilityCount+" utilities, you owe them rent of $"+rent+".  You only have $"+gamePlayObj.currPlayerObj.money+" left.  Therefore, you lose!</div>");			
		},
		youAlreadyOwnThis: function() {
			$("#messageBoard").append("<div class='message'>You already own this!  Let's move the game along!</div>");						
		},
		incomeTaxMessage: function(incomeTaxObj, gamePlayObj) {
			$("#messageBoard").append("<div class='message'>You landed on Income Tax, and thus owe the Bank.  The cheapest option for you was the "+incomeTaxObj.option+", for $"+incomeTaxObj.amount+". You have $"+gamePlayObj.currPlayerObj.money+" left.</div>");
		},

	};

	function CommunityChest(instructions, amount, earnOrPay, move, moveToPropNum, getOutOfJailFreeFlag, goToJailFlag) {
		this.instructions = instructions;
		this.amount = amount;
		this.earnOrPay = earnOrPay;
		this.move = move;
		this.moveToPropNum = moveToPropNum;
		this.getOutOfJailFreeFlag = getOutOfJailFreeFlag;
		this.goToJailFlag = goToJailFlag;
	}

	var commChest1 = new CommunityChest("XMAS Fund Matures. Collect $100",100,"earn",false,"",false);
	var commChest2 = new CommunityChest("You inherit $100",100,"earn",false,"",false);
	var commChest3 = new CommunityChest("From sale of stock you get $45",45,"earn",false,"",false);
	var commChest4 = new CommunityChest("Bank error in your favor, collect $200",200,"earn",false,"",false);
	var commChest5 = new CommunityChest("Pay hospital $100",100,"pay",false,"",false);
	var commChest6 = new CommunityChest("Doctors fee, pay $50",50,"pay",false,"",false);
	var commChest7 = new CommunityChest("Get out of Jail Free","","","","",true);
	var commChest8 = new CommunityChest("Receive for services, $25",25,"earn",false,"",false);
	var commChest9 = new CommunityChest("Pay school tax of $150",150,"earn",false,"",false);
	var commChest10 = new CommunityChest("Advance to go (collect $200",200,"earn",true,1,false);
	var commChest11 = new CommunityChest("You have won 2nd prize in a beauty contest, collect $10",10,"earn",false,"",false);
	var commChest12 = new CommunityChest("Collect $50 from the bank",50,"earn",false,"",false);
	var commChest13 = new CommunityChest("Income Tax refund, collect $20",20,"earn",false,"",false);
	var commChest14 = new CommunityChest("Life Insurance Matures, collect $100",100,"earn",false,"",false);
	var commChest15 = new CommunityChest("Go to jail. Go directly to jail. Do not pass go.","","",true,11,false,true);


		//GamePlay
	var monopGame = new GamePlay();
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
	var mediteranean = new Property(monopGame.incrementPropertyCount(),"Mediteran Ave","Purple",60,50,2);
	monopBoard.addToBoardArray(mediteranean);
	var commChest1 = new Property(monopGame.incrementPropertyCount(),"Comm Chest","","","");
	monopBoard.addToBoardArray(commChest1);
	var baltic = new Property(monopGame.incrementPropertyCount(),"Baltic Ave","Purple",80,50,4);
	monopBoard.addToBoardArray(baltic);
	var incTax = new Property(monopGame.incrementPropertyCount(),"Income Tax","Income Tax","","");
	monopBoard.addToBoardArray(incTax);
	var reading = new Property(monopGame.incrementPropertyCount(),"Reading RR","Railroad",200,25);
	monopBoard.addToBoardArray(reading);
	var oriental = new Property(monopGame.incrementPropertyCount(),"Oriental Ave","LightBlue",100,50,6);
	monopBoard.addToBoardArray(oriental);
	var chance1 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance1);
	var vermont = new Property(monopGame.incrementPropertyCount(),"Vermont Ave","LightBlue",100,50,6);
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
	var stJames = new Property(monopGame.incrementPropertyCount(),"St James Pl","Orange",120,100,14);
	monopBoard.addToBoardArray(stJames);
	var commChest2 = new Property(monopGame.incrementPropertyCount(),"Comm Chest","","","");
	monopBoard.addToBoardArray(commChest2);
	var tennessee = new Property(monopGame.incrementPropertyCount(),"Tennessee Ave","Orange",120,100,14);
	monopBoard.addToBoardArray(tennessee);
	var ny = new Property(monopGame.incrementPropertyCount(),"New York Ave","Orange",120,100,16);
	monopBoard.addToBoardArray(ny);
	var freeParking = new Property(monopGame.incrementPropertyCount(),"Free Parking","","","");
	monopBoard.addToBoardArray(freeParking);
	var kentucky = new Property(monopGame.incrementPropertyCount(),"Kentucky Ave","Red",120,150,18);
	monopBoard.addToBoardArray(kentucky);
	var chance3 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance3);
	var indiana = new Property(monopGame.incrementPropertyCount(),"Indiana Ave","Red",120,150,18);
	monopBoard.addToBoardArray(indiana);
	var illinois = new Property(monopGame.incrementPropertyCount(),"Illinois Ave","Red",120,150,20);
	monopBoard.addToBoardArray(illinois);
	var bo = new Property(monopGame.incrementPropertyCount(),"B&O Railroad","Railroad",200,25);
	monopBoard.addToBoardArray(bo);
	var atlantic = new Property(monopGame.incrementPropertyCount(),"Atlantic Ave","Yellow",260,150,22);
	monopBoard.addToBoardArray(atlantic);
	var ventnor = new Property(monopGame.incrementPropertyCount(),"Ventnor Ave","Yellow",260,150,22);
	monopBoard.addToBoardArray(ventnor);
	var waterWorks = new Property(monopGame.incrementPropertyCount(),"Water Works","Utility",150,"","Utility");
	monopBoard.addToBoardArray(waterWorks);
	var marvin = new Property(monopGame.incrementPropertyCount(),"Marvin Garden","Yellow",280,150,24);
	monopBoard.addToBoardArray(marvin);
	var goToJail = new Property(monopGame.incrementPropertyCount(),"Go To Jail","","","");
	monopBoard.addToBoardArray(goToJail);
	var pacific = new Property(monopGame.incrementPropertyCount(),"Pacific Ave","Green",300,200,26);
	monopBoard.addToBoardArray(pacific);
	var nc = new Property(monopGame.incrementPropertyCount(),"N.C. Ave","Green",300,200,26);
	monopBoard.addToBoardArray(nc);
	var commChest3 = new Property(monopGame.incrementPropertyCount(),"Comm Chest","","","");
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
	
	monopBoard.createHTMLBoard(player1,player2);
	monopBoard.updateHTMLDice(monopGame);
	monopGame.currPlayerObj = player1;
	monopGame.makeMove(monopBoard);
	// monopGame.currPlayerObj.makeMove(monopBoard,monopGame);	
});