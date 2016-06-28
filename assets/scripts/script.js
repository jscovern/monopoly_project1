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
		}
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
	}

	GamePlay.prototype = {
		incrementPlayerID: function() {
			this.playerCount += 1;
			return this.playerCount;
		},
		incrementPropertyCount: function() {
			this.propertyCount += 1;
			return this.propertyCount;
		}
	};

		//GamePlay
	var monopGame = new GamePlay();
	//players
	var player1 = new Player(monopGame.incrementPlayerID(),"black","yellow");
	var player2 = new Player(monopGame.incrementPlayerID(),"black","red");
	//MonopolyGroups
	var monopGroupPurple = new MonopolyGroup("Purple",2,50);
	var monopGroupLightBlue = new MonopolyGroup("LightBlue",3,50);
	var monopGroupMaroon = new MonopolyGroup("Maroon",3,100);
	var monopGroupOrange = new MonopolyGroup("Orange",3,100);
	var monopGroupRed = new MonopolyGroup("Red",3,150);
	var monopGroupYellow = new MonopolyGroup("Yellow",3,150);
	var monopGroupGreen = new MonopolyGroup("Green",3,200);
	var monopGroupBlue = new MonopolyGroup("Blue",2,200);
	//Properties
	var go = new Property(monopGame.incrementPropertyCount(),"Go","","","","");
	var mediteranean = new Property(monopGame.incrementPropertyCount(),"Mediteranean Ave","Purple",60,2);
	var commChest1 = new Property(monopGame.incrementPropertyCount(),"Community Chest","","","");
	var baltic = new Property(monopGame.incrementPropertyCount(),"Baltic Ave","Purple",80,4);
	var incTax = new Property(monopGame.incrementPropertyCount(),"Income Tax","Income Tax","","");
	var reading = new Property(monopGame.incrementPropertyCount(),"Reading RR","Railroad",200,25);
	var oriental = new Property(monopGame.incrementPropertyCount(),"Oriental Ave","LightBlue",100,6);
	var chance1 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	var vermont = new Property(monopGame.incrementPropertyCount(),"Vermont Ave","LightBlue",100,6);
	var connecticut = new Property(monopGame.incrementPropertyCount(),"Connecticut Ave","LightBlue",120,8);
	var jail = new Property(monopGame.incrementPropertyCount(),"Jail","","","");
	var boardwalk = new Property(monopGame.incrementPropertyCount(),"Board Walk","Blue",400,50);
	var stCharles = new Property(monopGame.incrementPropertyCount(),"St Charles","Maroon",140,10);
	var luxTax = new Property(monopGame.incrementPropertyCount(),"Luxury Tax","Luxury Tax","",75);
	var electric = new Property(monopGame.incrementPropertyCount(),"Electric Co","Utility",150,"");
	var parkPlace = new Property(monopGame.incrementPropertyCount(),"Park Pl","Blue",350,35);
	var states = new Property(monopGame.incrementPropertyCount(),"States Ave","Maroon",140,10);
	var chance2 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	var virginia = new Property(monopGame.incrementPropertyCount(),"Virginia Ave","Maroon",140,12);
	var shortLine = new Property(monopGame.incrementPropertyCount(),"Short Line","Railroad",200,25);
	var pennsylvaniaRR = new Property(monopGame.incrementPropertyCount(),"Pennsylvania RR","Railroad",200,25);
	var pennsylvania = new Property(monopGame.incrementPropertyCount(),"Pennsylvania Ave","Green",320,28);
	var stJames = new Property(monopGame.incrementPropertyCount(),"St James Pl","Orange",120,14);
	var commChest2 = new Property(monopGame.incrementPropertyCount(),"Community Chest","","","");
	var commChest3 = new Property(monopGame.incrementPropertyCount(),"Community Chest","","","");
	var nc = new Property(monopGame.incrementPropertyCount(),"North Carolina Ave","Green",300,26);
	var tennessee = new Property(monopGame.incrementPropertyCount(),"Tennessee Ave","Orange",120,14);
	var pacific = new Property(monopGame.incrementPropertyCount(),"Pacific Ave","Green",300,26);
	var ny = new Property(monopGame.incrementPropertyCount(),"New York Ave","Orange",120,16);
	var goToJail = new Property(monopGame.incrementPropertyCount(),"Go To Jail","","","");
	var marvin = new Property(monopGame.incrementPropertyCount(),"Marvin Gardens","Yellow",280,24);
	var waterWorks = new Property(monopGame.incrementPropertyCount(),"Water Works","Utility",150,"");
	var ventnor = new Property(monopGame.incrementPropertyCount(),"Ventnor Ave","Yellow",260,22);
	var atlantic = new Property(monopGame.incrementPropertyCount(),"Atlantic Ave","Yellow",260,22);
	var bo = new Property(monopGame.incrementPropertyCount(),"B&O Railroad","Railroad",200,25);
	var illinois = new Property(monopGame.incrementPropertyCount(),"Illinois Ave","Red",120,20);
	var indiana = new Property(monopGame.incrementPropertyCount(),"Indiana Ave","Red",120,18);
	var chance3 = new Property(monopGame.incrementPropertyCount(),"Chance","","","");
	var kentucky = new Property(monopGame.incrementPropertyCount(),"Kentucky Ave","Red",120,18);
	var freeParking = new Property(monopGame.incrementPropertyCount(),"Free Parking","","","");
});