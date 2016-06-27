$(document).ready(function(){
	var player1 = new Player(1,"black","yellow");
	var player2 = new Player(2,"black","red");
	var monopGroupPurple = new MonopolyGroup("Purple",2,"?");
	var monopGroupLightBlue = new MonopolyGroup("LightBlue",3,"?");
	var monopGroupMaroon = new MonopolyGroup("Maroon",3,"?");
	var monopGroupOrange = new MonopolyGroup("Orange",3,"?");
	var monopGroupRed = new MonopolyGroup("Red",3,150);
	var monopGroupYellow = new MonopolyGroup("Yellow",3,150);
	var monopGroupGreen = new MonopolyGroup("Green",3,"?");
	var monpGroupBlue = new MonopolyGroup("Blue",2,"?");

	function Player(playerNum, textColor, backgroundColor) {
		this.name = "Player"+playerNum;
		this.playerID = playerNum;
		this.marker = "P"+playerNum;
		this.color = textColor;
		this.background_color = backgroundColor;
		this.money = 1500;
		this.propertyCount = 0;
		this.monopolyCount = 0;
	}

	Player.prototype = {
		incrementPlayerID: function() {

		}
	};

	function Property(propID,title,group,price) {
		this.propertyID = propID;
		this.title = title;
		this.monopolyGroup = group;
		this.ownedBy="";
		this.price=price;
	}

	Property.prototype = {

	};

	function MonopolyGroup(group,propertyCount,housePrice) {
		this.monopolyGroup = group;
		this.propertyCount = propertyCount;
		this.housePrice = housePrice;
	}

});