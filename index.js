const path = require("path");
const fs = require("fs");
const Vec3 = require('tera-vec3');
module.exports = function TP(mod) {
	var gameId = null, isCastanic = false, isDrop = false, curHp = 0, maxHp = 0;
	var logic = 0, oLoc = null, tLoc = 0, wLoc = 0, aLoc = [], afterLoc = [], zzone=[],coords=[], aZone = 0, tZone = 0, sLoc = 0, x=0, y=0, z=0;
	var aBook = {}, radius = [ 0, 50, 90, 125, 150, 170, 180 ];
	try {
		aBook = require('./book.json'); }
	catch(e) { 
		aBook = {};
	}

	mod.command.add('tpmap', (arg) => {
        if(arg.includes("ChatLinkAction")){
            var array = arg.split("@");
            zzone = array[1];
            coords = array[2].split(",");
            x = coords[0];
            y = coords[1];
            z = coords[2].split('"')[0];
            console.log(aZone + " " + zzone);
            if(aZone == zzone){
                Move(x,y,z,0);
            }else{
                mod.command.message('You are not in the same zone as the linked location.')
            }
        }else{
            mod.command.message('The argument is not a linked location.')
        }
    })


	mod.command.add('tp', (arg1, arg2, arg3) => {
		if(arg1 && arg1.length > 0) arg1 = arg1.toLowerCase();
		if(arg2 && arg2.length > 0) arg2 = arg2.toLowerCase();
		if(arg3 && arg3.length > 0) arg3 = arg3.toLowerCase();
		switch (arg1) {
			case "hp":
			case "drop":
			case "fall":
				if (!arg2 || isDrop) {break;}
				arg2 = (curHp * 100 / maxHp) - Number(arg2);
				if(arg2 <= 0) {
					mod.command.message('Cannot drop to a value above or equal to your current HP.')
					break;
				}
				isDrop = true;
				mod.toServer('C_PLAYER_LOCATION', 5, Object.assign({}, aLoc, {
					loc: aLoc.loc.addN({z: 400 + arg2 * (isCastanic ? 20 : 10)}),
					type: 2
				}));
				mod.toServer('C_PLAYER_LOCATION', 5, Object.assign(aLoc, {
					type: 7
				}));
				isDrop = false;
				break;
			case "set":
			case "save":
				if (arg2) {
					arg3 = aLoc.loc.z + (arg3 ? Number(arg3) : 0);
					aBook[arg2] = {
						zone: aZone,
						x: aLoc.loc.x,
						y: aLoc.loc.y,
						z: arg3,
						w: wLoc
					}
					saveBook();
				} else {
					sLoc = aLoc;
					tZone = aZone;
					logic = 0;
				}
				mod.command.message(`Location is Saved ${arg2 ? '['+arg2+'] ' : ''}[Zone: ${aZone} x: ${Math.round(aLoc.loc.x)} y: ${Math.round(aLoc.loc.y)} z: ${Math.round(arg3)} w: ${Math.round(wLoc)}]`);
				break;
			case "to":
			case "warp":
			case "move":
				if (arg2) {
					if (!aBook[arg2]) {
						mod.command.message(`Cannot found book [${arg2}]`);
						break;
					} else if (aBook[arg2].zone != aZone){
						mod.command.message(`You are not in zone: ${aBook[arg2].zone}`);
						break;
					}
					Move(aBook[arg2].x,aBook[arg2].y,aBook[arg2].z,aBook[arg2].w);
				} else {
					if (aZone != tZone) {
						mod.command.message(`You are not in zone: ${tZone}`);
						break;
					}else if (tZone == 0){
						mod.command.message('Save your location first!');
					}
					if (logic == 0) {
						if (sLoc != 0) {
							oLoc = aLoc;
							Move(sLoc.loc.x,sLoc.loc.y,sLoc.loc.z,sLoc.w);
							logic = 1;
						} else { mod.command.message('Save your location first!'); }
					} else {
						Move(oLoc.x,oLoc.y,oLoc.z,oLoc.w);
						logic = 0;
					}
				}
				break;
			case "remove":
			case "delete":
			case "del":
				if (arg2) {
					if (!aBook[arg2]) {
						mod.command.message(`Cannot found book [${arg2}]`);
					} else {
						delete aBook[arg2];
						saveBook();
						mod.command.message(`Book [${arg2}] has removed`);
					}
				}
				break;
			case "blink":
				blink();
				break;
			case "back":
				if (tLoc != 0) {
					if (aZone != tLoc.zone){
						mod.command.message(`You are not in zone: ${tLoc.zone}`);
					}else{
						Move(tLoc.x,tLoc.y,tLoc.z,tLoc.w);
					}
				} else { mod.command.message('You should blink first!') }
				break;
			case "up":
				if (!arg2) {break;}
				TP(aLoc.loc.x,aLoc.loc.y,aLoc.loc.z+Number(arg2));
				break;
			case "down":
				if (!arg2) {break;}
				TP(aLoc.loc.x,aLoc.loc.y,aLoc.loc.z-Number(arg2));
				break;
			case "x":
				if (!arg3) {break;}
				arg3 = Number(arg3);
				switch (arg2) {
					case "+":
						TP(aLoc.loc.x+arg3,aLoc.loc.y,aLoc.loc.z);
						break;
					case "-":
						TP(aLoc.loc.x-arg3,aLoc.loc.y,aLoc.loc.z);
						break;
				}
				break;
			case "y":
				if (!arg3) {break;}
				arg3 = Number(arg3);
				switch (arg2) {
					case "+":
						TP(aLoc.loc.x,aLoc.loc.y+arg3,aLoc.loc.z);
						break;
					case "-":
						TP(aLoc.loc.x,aLoc.loc.y-arg3,aLoc.loc.z);
						break;
				}
				break;
			case "z":
				if (!arg3) {break;}
				arg3 = Number(arg3);
				switch (arg2) {
					case "+":
						TP(aLoc.loc.x,aLoc.loc.y,aLoc.loc.z+arg3);
						break;
					case "-":
						TP(aLoc.loc.x,aLoc.loc.y,aLoc.loc.z-arg3);
						break;
				}
				break;
			case "coord":
			case "where":
			case "loc":
			case "location":
				mod.command.message(`Zone: ${aZone} x: ${Math.round(aLoc.loc.x)} y: ${Math.round(aLoc.loc.y)} z: ${Math.round(aLoc.loc.z)} w: ${Math.round(wLoc)}`);
				break;
			default:
				if (arg1 && arg2 && arg3) {
					TP(Number(arg1),Number(arg2),Number(arg3));
				}
				break;
		}
		return false;
	});

	mod.hook('S_LOGIN', 14, (event) => {
		gameId = event.gameId;
		isCastanic = Math.floor((event.templateId - 10101) / 200) === 3;
	});
	
	mod.hook('C_PLAYER_LOCATION', 5, (event) => {
		if(!isDrop && (event.type == 2 || event.type == 10)) {
			return false;
		};
		wLoc = event.w;
	});

	mod.hook('C_PLAYER_LOCATION', 5, (event) => {
		if(!isDrop && (event.type == 2 || event.type == 10)) {
			return false;
		};
		aLoc = event;
	});
	
	mod.hook('S_PLAYER_STAT_UPDATE', 16, event => {
		curHp = event.hp;
		maxHp = event.maxHp;
	});

	mod.hook('S_CREATURE_CHANGE_HP', 6, event => {
		if (event.target == gameId) {
			curHp = event.curHp;
			maxHp = event.maxHp;
		}
	});

	mod.hook('S_LOAD_TOPO', 3, (event) => {
		aZone = event.zone;
	});
	
	function saveBook(){
		fs.writeFileSync(path.join(__dirname, "book.json"), JSON.stringify(aBook, null, 2));
	}
	
	function Move(x,y,z,w) {
		let m = new Vec3(x,y,z);
		mod.send('S_INSTANT_MOVE', 3, {
			gameId: gameId, loc: m, w: w
		});
		m = null;
	}
	
	function TP(x,y,z) {
		let m = new Vec3(x,y,z);
		mod.send('S_INSTANT_MOVE', 3, {
			gameId: gameId, loc: m
		});
		m = null;
	}
	
	function blink() {
		tLoc = {
			zone: aZone,
			x: aLoc.loc.x,
			y: aLoc.loc.y,
			z: aLoc.loc.z,
			w: wLoc
		};
		afterLoc = aLoc;
		
		afterLoc.loc.x = aLoc.loc.x + (Math.cos(wLoc)*200);
		afterLoc.loc.y = aLoc.loc.y + (Math.sin(wLoc)*200);
		afterLoc.loc.z = aLoc.loc.z + 5;
		
		Move(afterLoc.loc.x,afterLoc.loc.y,afterLoc.loc.z,wLoc);
	}
}