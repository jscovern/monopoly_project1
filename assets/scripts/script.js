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
	}

	Player.prototype = {
		buyRailRoad: function() {
			this.railRoadCount += 1;
		},
		buyProperty: function() {
			this.propertyCount += 1;
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
	};

	function Property(propID,title,group,price,housePrice,rent) {
		this.propertyID = propID;
		this.title = title;
		this.monopolyGroup = group;
		this.ownedBy="";
		this.price=price;
		this.rent=rent;
		this.houseCount = 0;
	}

	Property.prototype = {

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
		setCurrPlayerObj: function() {
				console.log(this.currPlayerObj.playerID);
				console.log(this.currPlayerObj.playerID);
				console.log(this.currPlayerObj);

			if(this.currPlayerObj.playerID === undefined || this.currPlayerObj.playerID === 2) {
				this.currPlayerObj = player1;
			} else {
				this.currPlayerObj = player2;
			}
		},
		makeMove: function(htmlBoardObj,gamePlayObj) {
			htmlBoardObj.updateHTMLDice(gamePlayObj);

			this.setCurrPlayerObj();
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
			console.log($("#prop"+propNum+" .players").html());
			if($("#prop"+propNum+" .players").html()==="") {
				str = "<span id="+playerObj.marker+">"+playerObj.marker+"</span>";
			} else {
				str = $("#prop"+propNum+" .players").html()+" <span id="+playerObj.marker+">"+playerObj.marker+"</span>";
			}
			$("#prop"+propNum+" .players").html(str);
		},
		updateHTMLDice: function(gamePlayObj) {
			var diceObj = gamePlayObj.rollDice();
			$("#dice1").text(diceObj.die1Value);
			$("#dice2").text(diceObj.die2Value);
			$("#dice1").css("transform","Rotate("+diceObj.die1Rotation+"deg)");
			$("#dice2").css("transform","Rotate("+diceObj.die2Rotation+"deg)");
		}
	};

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
	var mediteranean = new Property(monopGame.incrementPropertyCount(),"Mediteran Ave","Purple",60,2);
	monopBoard.addToBoardArray(mediteranean);
	var commChest1 = new Property(monopGame.incrementPropertyCount(),"Comm Chest","","","");
	monopBoard.addToBoardArray(commChest1);
	var baltic = new Property(monopGame.incrementPropertyCount(),"Baltic Ave","Purple",80,4);
	monopBoard.addToBoardArray(baltic);
	var incTax = new Property(monopGame.incrementPropertyCount(),"Income Tax","Income Tax","","");
	monopBoard.addToBoardArray(incTax);
	var reading = new Property(monopGame.incrementPropertyCount(),"Reading RR","Railroad",200,25);
	monopBoard.addToBoardArray(reading);
	var oriental = new Property(monopGame.incrementPropertyCount(),"Oriental Ave","LightBlue",100,6);
	monopBoard.addToBoardArray(oriental);
	var chance1 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance1);
	var vermont = new Property(monopGame.incrementPropertyCount(),"Vermont Ave","LightBlue",100,6);
	monopBoard.addToBoardArray(vermont);
	var connecticut = new Property(monopGame.incrementPropertyCount(),"Conn. Ave","LightBlue",120,8);
	monopBoard.addToBoardArray(connecticut);
	var jail = new Property(monopGame.incrementPropertyCount(),"Jail","","","");
	monopBoard.addToBoardArray(jail);
	var boardwalk = new Property(monopGame.incrementPropertyCount(),"Board Walk","Blue",400,50);
	monopBoard.addToBoardArray(boardwalk);
	var stCharles = new Property(monopGame.incrementPropertyCount(),"St Charles","Maroon",140,10);
	monopBoard.addToBoardArray(stCharles);
	var luxTax = new Property(monopGame.incrementPropertyCount(),"Luxury Tax","Luxury Tax","",75);
	monopBoard.addToBoardArray(luxTax);
	var electric = new Property(monopGame.incrementPropertyCount(),"Electric Co","Utility",150,"");
	monopBoard.addToBoardArray(electric);
	var parkPlace = new Property(monopGame.incrementPropertyCount(),"Park Pl","Blue",350,35);
	monopBoard.addToBoardArray(parkPlace);
	var states = new Property(monopGame.incrementPropertyCount(),"States Ave","Maroon",140,10);
	monopBoard.addToBoardArray(states);
	var chance2 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance2);
	var virginia = new Property(monopGame.incrementPropertyCount(),"Virginia Ave","Maroon",140,12);
	monopBoard.addToBoardArray(virginia);
	var shortLine = new Property(monopGame.incrementPropertyCount(),"Short Line","Railroad",200,25);
	monopBoard.addToBoardArray(shortLine);
	var pennsylvaniaRR = new Property(monopGame.incrementPropertyCount(),"Penn. RR","Railroad",200,25);
	monopBoard.addToBoardArray(pennsylvaniaRR);
	var pennsylvania = new Property(monopGame.incrementPropertyCount(),"Penn. Ave","Green",320,28);
	monopBoard.addToBoardArray(pennsylvania);
	var stJames = new Property(monopGame.incrementPropertyCount(),"St James Pl","Orange",120,14);
	monopBoard.addToBoardArray(stJames);
	var commChest2 = new Property(monopGame.incrementPropertyCount(),"Comm Chest","","","");
	monopBoard.addToBoardArray(commChest2);
	var commChest3 = new Property(monopGame.incrementPropertyCount(),"Comm Chest","","","");
	monopBoard.addToBoardArray(commChest3);
	var nc = new Property(monopGame.incrementPropertyCount(),"N.C. Ave","Green",300,26);
	monopBoard.addToBoardArray(nc);
	var tennessee = new Property(monopGame.incrementPropertyCount(),"Tennessee Ave","Orange",120,14);
	monopBoard.addToBoardArray(tennessee);
	var pacific = new Property(monopGame.incrementPropertyCount(),"Pacific Ave","Green",300,26);
	monopBoard.addToBoardArray(pacific);
	var ny = new Property(monopGame.incrementPropertyCount(),"New York Ave","Orange",120,16);
	monopBoard.addToBoardArray(ny);
	var goToJail = new Property(monopGame.incrementPropertyCount(),"Go To Jail","","","");
	monopBoard.addToBoardArray(goToJail);
	var marvin = new Property(monopGame.incrementPropertyCount(),"Marvin Garden","Yellow",280,24);
	monopBoard.addToBoardArray(marvin);
	var waterWorks = new Property(monopGame.incrementPropertyCount(),"Water Works","Utility",150,"");
	monopBoard.addToBoardArray(waterWorks);
	var ventnor = new Property(monopGame.incrementPropertyCount(),"Ventnor Ave","Yellow",260,22);
	monopBoard.addToBoardArray(ventnor);
	var atlantic = new Property(monopGame.incrementPropertyCount(),"Atlantic Ave","Yellow",260,22);
	monopBoard.addToBoardArray(atlantic);
	var bo = new Property(monopGame.incrementPropertyCount(),"B&O Railroad","Railroad",200,25);
	monopBoard.addToBoardArray(bo);
	var illinois = new Property(monopGame.incrementPropertyCount(),"Illinois Ave","Red",120,20);
	monopBoard.addToBoardArray(illinois);
	var indiana = new Property(monopGame.incrementPropertyCount(),"Indiana Ave","Red",120,18);
	monopBoard.addToBoardArray(indiana);
	var chance3 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	monopBoard.addToBoardArray(chance3);
	var kentucky = new Property(monopGame.incrementPropertyCount(),"Kentucky Ave","Red",120,18);
	monopBoard.addToBoardArray(kentucky);
	var freeParking = new Property(monopGame.incrementPropertyCount(),"Free Parking","","","");
	monopBoard.addToBoardArray(freeParking);
	monopBoard.createHTMLBoard(player1,player2);
	monopBoard.updateHTMLDice(monopGame);
	monopGame.setCurrPlayerObj();
	console.log(monopGame.currPlayerObj);
});